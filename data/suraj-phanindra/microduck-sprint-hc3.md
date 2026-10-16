# suraj-phanindra/microduck-sprint-hc3

## Resumen

microduck-sprint-hc3 es una política de control para el robot microduck de Pollen Robotics, publicada por el usuario suraj-phanindra en HuggingFace. No se trata de un modelo de lenguaje, sino de una policy neuronal de reinforcement learning exportada a ONNX que genera una marcha perpetua para el robot: se ejecuta de forma continua hasta que se le indique lo contrario. Está diseñada para el robot microduck, que trabaja con observaciones de 61 dimensiones y 14 acciones a una frecuencia de control de 50 Hz.

El modelo es un fine-tune de juicenv/microduck-sprint-es10 mediante elitist hill climbing sobre la puntuación de la Arena. La normalización de las observaciones está integrada dentro del propio fichero `policy.onnx`, de modo que el consumidor puede alimentar observaciones en bruto sin preprocesado adicional. Se distribuye con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada y muy específica: es un artefacto de robótica de código abierto orientado a desplegar una marcha concreta en un robot microduck, dentro del ecosistema de entrenamiento `pollen-robotics/microduck_rl`. No aplica a tareas de generación de texto, visión o razonamiento, y la información publicada por el autor es mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning exportada a ONNX; detalles de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Pipeline | robotics |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Modelo base | juicenv/microduck-sprint-es10 (relación: finetune) |
| Método de ajuste | elitist hill climb sobre la puntuación de la Arena |
| Librería | microduck |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red en la información disponible. Lo que sí se conoce es que se trata de una política de control entrenada por reinforcement learning para el robot microduck, que mapea un vector de observación de 61 dimensiones a 14 acciones a 50 Hz. La política se exporta a ONNX y la normalización de observaciones queda incorporada dentro del propio grafo `policy.onnx`, lo que simplifica el despliegue en el robot.

El entrenamiento parte del modelo base juicenv/microduck-sprint-es10 y aplica un ajuste fino mediante elitist hill climbing optimizando la puntuación de la Arena (Arena score). No se especifican el número de iteraciones, la composición de datos ni si hubo fases adicionales de ajuste. El pipeline de entrenamiento referenciado es el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`. El resultado es una política calificada como "perpetua": una marcha que se mantiene activa de forma indefinida hasta que se detiene explícitamente.

## Capacidades

- Generación de una marcha perpetua para el robot microduck: la política produce acciones de control continuas hasta que se le ordena parar.
- Control a 50 Hz con un vector de observación de 61 dimensiones y 14 acciones de salida, adaptado a la morfología del microduck.
- Normalización de observaciones integrada en el grafo ONNX, de modo que acepta observaciones en bruto sin preprocesado externo.
- Carga como slot de política en el robot mediante el comando `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2.
- No dispone de capacidades de lenguaje, visión, tool calling ni razonamiento multi-paso: es exclusivamente una política motora de bajo nivel.

## Casos de uso

- Locomoción autónoma del microduck: cargar la política en un slot y dejar que el robot ejecute una marcha continua sin intervención, adecuada para demostraciones de desplazamiento sostenido.
- Investigación en reinforcement learning aplicado a robótica: usar esta política como punto de partida o referencia dentro del pipeline `microduck_rl` para comparar variantes de entrenamiento.
- Experimentos de sim-to-real: al ser un fine-tune de un modelo base ya entrenado, sirve para evaluar cómo se transfiere una marcha afinada por hill climbing al robot físico.
- Base para ajustes posteriores: al ser un finetune de juicenv/microduck-sprint-es10, puede utilizarse como inicialización para nuevas rondas de optimización sobre la Arena.
- Despliegue en talleres educativos: la carga en un slot mediante un único comando facilita su uso en entornos de docencia o demostración con hardware microduck.
- Pruebas de robustez de la marcha: ejecutar la política de forma prolongada permite observar la estabilidad y la deriva del comportamiento a lo largo del tiempo.
- Integración en bancos de pruebas de control: la salida ONNX puede alimentarse desde entornos simulados compatibles para validar la política antes de pasarla al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor indica que el ajuste se realizó mediante elitist hill climbing sobre la puntuación de la Arena, pero no se proporciona el valor de esa puntuación ni métricas comparativas de ningún tipo.

## Requisitos de hardware

- El destino natural de ejecución es el propio robot microduck a través de su daemon, con una frecuencia de control de 50 Hz; no se trata de un modelo pensado para GPU de centro de datos.
- Al ser un modelo exportado a ONNX y con un tamaño de repositorio de 0.0 GB, la huella de memoria es reducida y compatible con hardware embebido; no se publican cifras exactas de VRAM o RAM.
- Requisitos de GPU concretos (A100, H100, RTX 4090, etc.): no disponibles.
- Opciones de despliegue: carga en el robot mediante `robotctl policy load <slot>`, usando el runtime de la librería microduck sobre el grafo `policy.onnx`.
- Latencia y throughput estimados: no disponibles. El único dato conocido es la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

| Modelo | Relación | Observaciones | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| suraj-phanindra/microduck-sprint-hc3 | Modelo evaluado | 61 | 14 | 50 Hz | no disponible | HuggingFace |
| juicenv/microduck-sprint-es10 | Modelo base (finetune) | 61 | 14 | 50 Hz | no disponible | HuggingFace |
| Otras políticas de microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras alternativas comparables más allá del modelo base del que deriva.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay garantía de uso comercial ni condiciones de redistribución claras; conviene contactar con el autor antes de cualquier uso en producción.
- Información muy escasa: la model card no documenta arquitectura, número de parámetros, datos de entrenamiento ni métricas, lo que dificulta la evaluación técnica y la reproducibilidad.
- Riesgo de sobreajuste a la Arena: al optimizarse mediante elitist hill climbing sobre una única métrica, la política puede haber mejorado esa puntuación sin garantizar robustez general.
- Brecha sim-to-real: no se documenta si el entrenamiento fue en simulación ni cómo se comporta la marcha en el robot físico frente a posibles variaciones de terreno, carga o desgaste.
- Comportamiento perpetuo: la política está pensada para ejecutarse indefinidamente, por lo que requiere una parada explícita; en un despliegue real debe preverse un mecanismo de interrupción.
- Especificidad total: solo sirve para el robot microduck con su configuración de 61 observaciones y 14 acciones; no es reutilizable en otras plataformas ni tareas.
- No aplica el concepto de alucinación, pero sí el de deriva de control: sin datos de estabilidad a largo plazo, no puede asegurarse un comportamiento consistente en ejecuciones prolongadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suraj-phanindra/microduck-sprint-hc3
- Modelo base: https://huggingface.co/juicenv/microduck-sprint-es10
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` (URL no proporcionada)
