# tbd-lab/continual-learning-checkpoints

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino un conjunto de adaptadores LoRA y estados de entrenamiento de experimentos de continual learning sobre el modelo base denominado Qwen3.8-27B. Lo publica tbd-lab y ocupa 2327 GB; incluye el punto de partida compartido, ejecuciones de self-distillation offline (step2) y episodios completos entrenados online (2c), con variantes de teacher y de media móvil exponencial (EMA).

Su interés es la reproducibilidad: conserva checkpoints que permiten reanudar entrenamientos, comparar estrategias de self-distillation y estudiar olvido catastrófico en un contexto de aprendizaje continuo. No es un modelo desplegable por sí mismo: los pesos del base no se incluyen y las especificaciones de arquitectura, contexto o idiomas no están documentadas.

La licencia es `other` sin términos detallados, y los estados `.pt` están atados al número de GPU y a un fork de verl, lo que limita su portabilidad. Es material para investigación, no para producción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el repositorio contiene adaptadores LoRA y estados de entrenamiento, no un modelo completo. El base se denomina Qwen
