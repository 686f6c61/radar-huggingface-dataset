# ywsldxk1/so101-pi05-staged-fullft-20261113

## Resumen

SO-101 Bench pi0.5 staged full fine-tuning es un checkpoint de robótica basado en el modelo pi0.5 (política visión-lenguaje-acción de Physical Intelligence) y publicado por el usuario ywsldxk1 en Hugging Face. Se trata de un ajuste fino completo (full fine-tuning, sin LoRA ni bloques congelados de forma intencionada) sobre el checkpoint base `5hadytru/so101_bench_pi05`, orientado al banco de pruebas SO-101. El modelo está en fase de entrenamiento activo y el propio autor advierte de que los checkpoints intermedios son experimentales y no se reclama ningún resultado de éxito en tareas.

El entrenamiento se estructura en dos etapas: una etapa A sobre el conjunto core41 (250 actualizaciones del optimizador) y una etapa B que continúa con los mismos pesos y estado de Adam durante otras 250 actualizaciones, mezclando muestras de core41 y official32 con probabilidades del 75 % y 25 % respectivamente. Se emplea un microbatch de 8 con acumulación de 4 (batch efectivo de 32), cuatro entradas de cámara, acciones a 30 Hz y un action chunk de 30. El repositorio ocupa 9,4 GB e incluye tanto archivos de inferencia públicos como estados de recuperación cifrados.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para quienes experimentan con ajuste fino completo de políticas VLA en robots de bajo coste tipo SO-101 y quieren inspeccionar la estrategia de entrenamiento por etapas, la preservación de estados de optimizador reanudables y la separación entre checkpoints de inferencia y estados de recuperación privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política visión-lenguaje-acción pi0.5 (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo parte de `5hadytru/so101_bench_pi05` (revisión `122d1ca2cd0dbd60e4cfed748e34826307d33365`) y aplica un ajuste fino completo de todos los parámetros, sin LoRA y sin bloques congelados de forma deliberada; según la model card, los parámetros desconectados del grafo de la pérdida de acción no reciben gradiente de forma natural. El entrenamiento se divide en dos etapas: la etapa A usa únicamente el conjunto core41 durante 250 actualizaciones del optimizador, y la etapa B continúa desde los mismos pesos y el mismo estado de Adam durante otras 250 actualizaciones, muestreando core41 y official32 con probabilidades del 75 % y 25 %. La configuración es microbatch 8, acumulación 4 y batch efectivo 32.

Se mantienen el preprocesado y la normalización originales del checkpoint base. La entrada incluye cuatro cámaras y la salida son acciones a 30 Hz con un action chunk de 30. Se publican checkpoints intermedios de inferencia (A100, A200, B100, B200), puntos finales de etapa (A250 y B250) que conservan estado reanudable de optimizador y RNG, y un checkpoint adicional de validación de recuperación (A1). Los archivos de inferencia públicos aparecen bajo `pretrained_model/` de cada checkpoint; los estados completos de recuperación están comprimidos y cifrados bajo `recovery/`, con la clave privada en poder del propietario del proyecto. Los backups verificados incluyen recibos SHA256.

## Capacidades

- Generación de acciones robóticas a partir de observaciones multimodales (cuatro cámaras) para el robot SO-101.
- Control a 30 Hz con predicción de secuencias de acción (action chunk de 30).
- Política visión-lenguaje-acción derivada de pi0.5, orientada a manipulación robótica.
- Reanudación de entrenamiento desde checkpoints con estado de optimizador y RNG preservado (A250, B250).
- Validación de recuperación mediante el checkpoint A1.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en ajuste fino completo de políticas VLA: el repositorio permite inspeccionar la estrategia de dos etapas (core41 y mezcla 75/25 con official32) y comparar con alternativas con LoRA.
- Reproducción de experimentos en el banco SO-101: los checkpoints intermedios A100, A200, B100 y B200 permiten trazar la evolución del entrenamiento y medir la reproducción de tareas de entrenamiento (no generalización retenida).
- Evaluación de estabilidad de entrenamiento: los puntos A250 y B250 conservan estado reanudable, lo que facilita análisis de convergencia y comparaciones entre etapas.
- Validación de pipelines de recuperación: el checkpoint A1 y los estados cifrados bajo `recovery/` sirven para probar flujos de restauración con verificación SHA256.
- Desarrollo de control robótico con múltiples cámaras: la configuración de cuatro entradas de cámara y acciones a 30 Hz es adecuada para tareas de manipulación que requieren realimentación visual densa.
- Estudio de protocolos de evaluación en robótica: el autor advierte que los 73 episodios reparados no constituyen un conjunto de test independiente, lo que convierte al modelo en un caso útil para discutir sesgos de evaluación y reconstrucción de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el entrenamiento está en curso y que no se reclama ningún resultado de éxito en tareas. Además, señala que los 73 episodios de entrenamiento reparados no son un conjunto de test independiente y que la reconstrucción Part3A mide reproducción de tareas de entrenamiento, no generalización retenida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se detalla el número de parámetros ni la cuantización).
- GPU recomendadas: no disponible; la model card menciona checkpoints etiquetados A100, A200, B100 y B200, pero no especifica hardware de despliegue.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: librería `lerobot` (según los metadatos del repositorio); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se especifica control a 30 Hz y action chunk de 30, pero sin mediciones de rendimiento publicadas.
- Tamaño del repositorio: 9,4 GB, lo que condiciona el espacio de almacenamiento necesario para descargar checkpoints y estados de recuperación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-pi05-staged-fullft-20261113 | no disponible | no disponible | sin benchmarks publicados; entrenamiento en curso | no disponible | Hugging Face (ywsldxk1) |
| 5hadytru/so101_bench_pi05 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos pi0.5 de la familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenamiento en curso: los checkpoints intermedios son experimentales y el autor no reclama ningún resultado de éxito en tareas.
- Los 73 episodios de entrenamiento reparados no constituyen un conjunto de test independiente; la reconstrucción Part3A mide reproducción de tareas de entrenamiento, no generalización retenida.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se documenta el soporte multilingüe.
- Los estados completos de recuperación están cifrados y la clave privada no se publica, lo que limita la reproducibilidad completa del entrenamiento por terceros.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de una política robótica, los fallos se manifestarían como acciones incorrectas más que como texto alucinado.
- Sin benchmarks publicados: no es posible comparar su rendimiento con alternativas de forma objetiva.
- Tamaño del repositorio de 9,4 GB: requiere planificación de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ywsldxk1/so101-pi05-staged-fullft-20261113
- Checkpoint base: https://huggingface.co/5hadytru/so101_bench_pi05
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
