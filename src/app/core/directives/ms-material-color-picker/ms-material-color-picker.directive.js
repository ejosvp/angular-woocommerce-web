(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msMaterialColorPicker', msMaterialColorPicker);

    /** @ngInject */
    function msMaterialColorPicker($mdMenu, $mdColorPalette, fuseGenerator)
    {
        return {
            require    : 'ngModel',
            restrict   : 'E',
            scope      : {
                ngModel    : '=',
                msModelType: '@?'
            },
            templateUrl: 'app/core/directives/ms-material-color-picker/ms-material-color-picker.html',
            link       : function ($scope, element, attrs, ngModel)
            {
                // Material Color Palette
                $scope.palettes = $mdColorPalette;
                $scope.selectedPalette = false;
                $scope.selectedHues = false;

                /**
                 * ModelType: 'obj', 'class'(default)
                 * @type {string|string}
                 */
                $scope.msModelType = $scope.msModelType || 'class';

                /**
                 * Initialize / Watch model changes
                 */
                $scope.$watch('ngModel', setSelectedColor);

                /**
                 * Activate Hue Selection
                 * @param palette
                 * @param hues
                 */
                $scope.activateHueSelection = function (palette, hues)
                {
                    $scope.selectedPalette = palette;
                    $scope.selectedHues = hues;
                };

                /**
                 * Select Color
                 * @type {selectColor}
                 */
                $scope.selectColor = function (palette, hue)
                {
                    // Update Selected Color
                    updateSelectedColor(palette, hue);

                    // Update Model Value
                    updateModel();

                    // Hide The picker
                    $mdMenu.hide();
                };

                $scope.removeColor = function ()
                {

                    $scope.selectedColor = {
                        palette: '',
                        hue    : '',
                        class  : ''
                    };

                    $scope.activateHueSelection(false, false);

                    updateModel();
                };

                /**
                 * Set SelectedColor by model type
                 */
                function setSelectedColor()
                {
                    if ( !ngModel.$viewValue || ngModel.$viewValue === '' )
                    {
                        return;
                    }

                    var palette, hue;

                    // If ModelType Class
                    if ( $scope.msModelType === 'class' )
                    {
                        var color = ngModel.$viewValue.split('-');
                        if ( color.length >= 5 )
                        {
                            palette = color[1] + '-' + color[2];
                            hue = color[3];
                        }
                        else
                        {
                            palette = color[1];
                            hue = color[2];
                        }
                    }
                    // If ModelType Object
                    else if ( $scope.msModelType === 'obj' )
                    {
                        palette = ngModel.$viewValue.palette;
                        hue = ngModel.$viewValue.hue || 500;
                    }

                    // Update Selected Color
                    updateSelectedColor(palette, hue);
                }


                /**
                 * Update Selected Color
                 * @param palette
                 * @param hue
                 */
                function updateSelectedColor(palette, hue)
                {
                    $scope.selectedColor = {
                        palette     : palette,
                        hue         : hue,
                        class       : 'md-' + palette + '-' + hue + '-bg',
                        bgColorValue: fuseGenerator.rgba($scope.palettes[palette][hue].value),
                        fgColorValue: fuseGenerator.rgba($scope.palettes[palette][hue].contrast)
                    };

                    // If Model object not Equals the selectedColor update it
                    // it can be happen when the model only have pallete and hue values
                    if ( $scope.msModelType === 'obj' && !angular.equals($scope.selectedColor, ngModel.$viewValue) )
                    {
                        // Update Model Value
                        updateModel();
                    }

                    $scope.activateHueSelection(palette, $scope.palettes[palette]);
                }

                /**
                 * Update Model Value by model type
                 */
                function updateModel()
                {
                    if ( $scope.msModelType === 'class' )
                    {
                        ngModel.$setViewValue($scope.selectedColor.class);
                    }
                    else if ( $scope.msModelType === 'obj' )
                    {
                        ngModel.$setViewValue($scope.selectedColor);
                    }
                }
            }
        };
    }
})();