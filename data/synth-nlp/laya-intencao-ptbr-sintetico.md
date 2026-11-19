# Synth-NLP/laya-intencao-ptbr-sintetico

## Resumen

Laya + sintéticos pt-BR es un modelo de clasificación de intenciones en portugués de Brasil desarrollado por Synth-NLP. Se trata de un ajuste fino del modelo base [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya), un modelo de decisión de 321,9 millones de parámetros que recibe una frase y una lista de opciones (intenciones candidatas) y selecciona la que corresponde al usuario. El modelo resuelve el problema de la clasificación de intenciones con conjuntos de etiquetas abiertos, donde el clasificador debe elegir entre opciones que puede no haber visto durante el entrenamiento.

Su relevancia radica en el experimento que documenta: evaluar si los datos sintéticos en portugués mejoran la generalización de clasificadores de intención, especialmente en intenciones no vistas durante el entrenamiento. El modelo combina los 5.405 ejemplos reales del conjunto MASSIVE pt-BR con 20.383 frases sintéticas generadas mediante una pipeline agéntica con modelos abiertos, alcanzando una precisión de 0,763 en escenarios no vistos y 0,908 en escenarios vistos (con 20 opciones por frase, azar = 0,050).

El checkpoint publicado corresponde a la mejor de tres semillas de entrenamiento y se distribuye bajo licencia Apache 2.0. El modelo está pensado para investigación y evaluación de técnicas de aumento de datos sintéticos, no como un clasificador de producción listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión Laya (decision-model) sobre transformer; detalles de arquitectura interna no disponibles |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base Laya, un «decision-model» que formula la clasificación como una elección entre opciones presentadas en la entrada, en lugar de una cabeza de clasificación con etiquetas fijas. El ajuste se realizó con `laya.train.finetune` 0.4.14 usando los valores por defecto: 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`. Se entrenaron tres semillas y se publica la mejor (semilla 2).

El conjunto de entrenamiento contiene 25.788 filas: los 5.405 ejemplos reales de MASSIVE pt-BR (30 intenciones) más 20.383 frases sintéticas, de las cuales parte cubren esas 30 intenciones y parte cubren 30 intenciones nuevas. Las frases sintéticas se generaron con una pipeline agéntica que planifica peticiones variadas por intención (personas, situaciones cotidianas, estilos de escritura de oasst1 y peticiones contrastivas contra la intención vecina más parecida), genera con Gemma 4 12B y Qwen3.5-9B, reescribe parte con Evol-Instruct, filtra duplicados y frases demasiado parecidas al conjunto de test mediante Qwen3-Embedding-0.6B, y valida con dos jueces LLM que deben coincidir en la intención. Finalmente selecciona las frases difíciles para el modelo y usa sus errores para pedir la siguiente ronda (LLM2LLM). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Clasificación de intenciones en pt-BR mediante elección entre una lista de opciones proporcionada en la entrada.
- Manejo de conjuntos de etiquetas abiertos: las opciones se pasan en tiempo de inferencia, no están fijas en los pesos.
- Generalización a intenciones no vistas durante el entrenamiento (precisión de 0,763 en escenarios no vistos).
- Formato de salida estructurado: devuelve la opción elegida dentro de un diccionario de respuestas.
- Soporte de instrucciones configurables («O que o usuário está pedindo?») junto con los criterios de elección.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio ni tool calling.

## Casos de uso

- Enrutamiento de peticiones en asistentes conversacionales: dado un mensaje del usuario y el catálogo de intenciones del sistema, el modelo selecciona la intención para dirigir la conversación al flujo adecuado, con la ventaja de que el catálogo puede cambiarse sin reentrenar.
- Investigación sobre aumento de datos sintéticos: sirve como checkpoint de referencia para reproducir el experimento de si los datos sintéticos en portugués mejoran la generalización a intenciones no vistas.
- Evaluación de clasificadores con etiquetas abiertas: útil para comparar enfoques de decisión frente a clasificadores tradicionales de cabeza fija en conjuntos como MASSIVE pt-BR.
- Prototipado de sistemas de atención al cliente en portugués: permite probar rápidamente un enrutador de intenciones con un catálogo reducido antes de invertir en un clasificador dedicado.
- Clasificación de consultas en dominios nuevos: al aceptar opciones en tiempo de inferencia, se puede desplegar sobre un dominio con intenciones que el modelo no vio en entrenamiento, asumiendo la pérdida de precisión documentada.
- Filtrado y triaje de mensajes entrantes: clasificar consultas de usuarios en categorías operativas (clima, agenda, domótica, etc.) para su derivación automática.

## Benchmarks y rendimiento

Resultados en la validación de MASSIVE pt-BR con 20 opciones por frase (azar = 0,050). Los escenarios «no vistas» son conjuntos completos reservados: ninguna frase, intención ni dominio de ellos entró en el entrenamiento ni en la generación de sintéticos. Las comparaciones con Jev usan el sorteo 0 de opciones; el resto, la media de 3 sorteos.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| Kev-4B + sintéticos pt-BR | kev-4b | 0,867 | 0,933 |
| Kev-0.8B + sintéticos pt-BR | kev-0.8b | 0,815 | 0,917 |
| Laya + sintéticos pt-BR (este) | laya | 0,763 | 0,908 |

Ablación del efecto de los datos sintéticos sobre el mismo modelo base:

| Configuración | No vistas | Vistas |
|---|---:|---:|
| Ajustado solo con los 5.405 ejemplos reales | 0,729 | 0,894 |
| Ajustado con reales + sintéticos (este) | 0,760 | 0,903 |

El ganancia del sintético sobre el ajuste solo con reales en escenarios no vistos es de +3,2 puntos [+1,0; +5,5] (media de 3 semillas, intervalo de 95 % con bootstrap pareado por frase). En escenarios vistos, reales y reales + sintéticos empatan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 321,9 millones de parámetros en safetensors, el peso en fp32 ronda 1,3 GB y en fp16 unos 0,65 GB, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible. El checkpoint proviene de una rama de entrenamiento en A100 (`a100-seed-2`), pero no se especifican requisitos de inferencia.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: la librería `laya` (`laya.load` y `agente.predict`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | No vistas | Vistas | Licencia |
|---|---|---:|---:|---:|---|
| Laya + sintéticos pt-BR | laya | 321,9 M | 0,763 | 0,908 | Apache 2.0 |
| Kev-4B + sintéticos pt-BR | kev-4b | No disponible | 0,867 | 0,933 | No disponible |
| Kev-0.8B + sintéticos pt-BR | kev-0.8b | No disponible | 0,815 | 0,917 | No disponible |
| Jev (API de TypeSafe) | — | No disponible (API) | 0,863 | 0,864 | No disponible (servicio) |

El modelo es el más pequeño de los evaluados en el experimento y el que menor precisión obtiene en escenarios no vistos, aunque supera a Jev en escenarios vistos. Kev-4B lidera ambas métricas.

## Limitaciones y advertencias

- Menor precisión en escenarios no vistos (0,763) que los modelos Kev y que Jev; no es adecuado si la generalización a intenciones nuevas es crítica.
- El experimento se limita a una única tarea (elección de intención) y a un único conjunto de datos (MASSIVE pt-BR).
- Los modelos Kev del experimento se entrenaron con una sola semilla, lo que limita la solidez de las comparaciones entre ellos.
- El pt-BR de MASSIVE es una localización generada por LLM a partir del pt-PT, lo que puede introducir artefactos lingüísticos.
- El modelo solo cubre portugués de Brasil; no se documenta soporte multilingüe.
- Riesgo de alucinación en el sentido de seleccionar una opción incorrecta cuando ninguna de las opciones se ajusta a la petición; no se documentan métricas de abstención.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera del conjunto MASSIVE.
- Licencia Apache 2.0 permite uso comercial, pero las frases reales de MASSIVE son © Amazon.com, Inc. o afiliadas bajo CC BY 4.0, lo que exige atribución.
- Los pesos derivan de convaiinnovations/laya; conviene revisar las condiciones del modelo base.
- No se documentan cuantizaciones ni soporte para motores de inferencia estándar, lo que puede limitar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-intencao-ptbr-sintetico
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Kev-4B + sintéticos pt-BR: https://huggingface.co/Synth-NLP/kev-4b-intencao-ptbr-sintetico
- Kev-0.8B + sintéticos pt-BR: https://huggingface.co/Synth-NLP/kev-0.8b-intencao-ptbr-sintetico
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
- Gemma 4 12B: https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
