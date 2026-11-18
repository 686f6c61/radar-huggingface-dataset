# Tractorman/bitnet-b1.58-2B-4T-TQ2_0-GGUF

## Resumen

Tractorman/bitnet-b1.58-2B-4T-TQ2_0-GGUF es una cuantizacion en formato GGUF del modelo microsoft/bitnet-b1.58-2B-4T, un transformer de 2.412.820.480 parametros (aproximadamente 2,4 mil millones) entrenado con pesos ternarios (-1, 0, +1) en sus capas lineales. El autor original es Microsoft Research, que publico los pesos bajo licencia MIT; esta version concreta la ha generado el usuario Tractorman para un proyecto universitario de diseno de SoC (ECE382M, UT Austin).

La particularidad tecnica es que las 210 matrices ternarias del modelo (q, k, v, o, gate, up y down de las 30 capas) se almacenan en el tipo de cuantizacion `TQ2_0` de llama.cpp en su formato principal, en lugar del tipo `I2_S` que usa bitnet.cpp. El objetivo declarado es poder ejecutar el modelo en llama.cpp estandar, no en el runtime especifico de BitNet.

Es relevante porque permite probar un modelo BitNet de 2B con pesos ternarios exactos en toolchains convencionales, aunque con una advertencia critica: llama.cpp de serie no interpreta la clave `bitnet.hidden_activation = relu2` que usa este modelo (la FFN se activa con ReLU al cuadrado), por lo que requiere un parche de una linea en `src/models/bitnet.cpp` para producir salidas correctas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (BitNet b1.58), 30 capas |
| Parametros totales | 2.412.820.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_0 (matrices ternarias), Q8_0 (embeddings y capa de salida), F32 (normas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un unico fichero de 895.749.056 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 30 capas en el que las proyecciones lineales de atencion y de la red feed-forward usan pesos ternarios: cada valor es -1, 0 o +1 multiplicado por la escala del tensor. Esta es la propuesta de BitNet b1.58, que sustituye la multiplicacion matricial densa por sumas y restas enteras, reduciendo drasticamente el coste computacional y de memoria en hardware adecuado. La FFN usa una activacion ReLU al cuadrado (`relu2`), no SiLU, y la capa de salida esta atada (tied) a los embeddings de tokens. El tokenizador es Llama 3 BPE (`llama-bpe`) e incluye plantilla de chat.

En esta version concreta, el autor ha convertido los pesos originales de Hugging Face a GGUF con `convert_hf_to_gguf.py` en F16 y despues los ha cuantizado a `TQ2_0` con `llama-quantize`, forzando embeddings y capa de salida a `Q8_0`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable es la preservacion exacta de los valores ternarios (no hay error de cuantizacion en las matrices ternarias, solo en la escala) y la inclusion de la clave `hidden_activation` en el GGUF para que un llama.cpp parcheado pueda reconstruir la arquitectura correctamente.

## Capacidades

- Generacion de texto conversacional: el modelo incluye plantilla de chat y esta etiquetado como `conversational`.
- Razonamiento basico y respuesta a instrucciones: propio de un modelo base de 2B ajustado para对话; no se detallan capacidades especificas en la informacion disponible.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el tokenizador es Llama 3 BPE, que cubre varios idiomas, pero no se especifica el conjunto soportado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ejecucion eficiente en hardware con soporte de operaciones ternarias: el formato TQ2_0 permite inferencia de bajo coste en llama.cpp.

## Casos de uso

- Investigacion en arquitecturas ternarias: permite reproducir y validar el comportamiento de BitNet b1.58 en un runtime estandar (llama.cpp) sin depender de bitnet.cpp, util para comparar precision y velocidad entre ambos caminos.
- Prototipado de SoC y aceleradores: el proyecto original (ECE382M) usa este GGUF para disenar y simular hardware que ejecute operaciones ternarias; sirve como referencia de pesos y de formato de datos.
- Despliegue en entornos con memoria muy limitada: el fichero de 0,9 GB y los pesos ternarios permiten ejecutar un modelo de 2,4B en dispositivos con poca RAM o VRAM, como placas embebidas o portatiles modestos.
- Pruebas de cuantizacion y compatibilidad de llama.cpp: util para verificar el soporte de `TQ2_0` y de la clave `hidden_activation` en distintas versiones y forks de llama.cpp.
- Generacion de texto offline en aplicaciones de escritorio: al caber en CPU y en GPU consumer, puede integrarse en asistentes locales sin conexion.
- Docencia y experimentacion con modelos pequenos: permite a estudiantes inspeccionar pesos ternarios, plantillas de chat y el proceso de conversion HF a GGUF en un caso real y de tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 895.749.056 bytes (aproximadamente 0,83 GiB); con overhead de runtime, se puede ejecutar con menos de 1,5 GB de memoria.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien cabe en A100, H100 y RTX 4090 sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU.
- Opciones de despliegue: llama.cpp (requiere un build que lea `bitnet.hidden_activation`; el llama.cpp estandar usa SiLU y produce salidas incorrectas), Ollama (si acepta el GGUF y el parche), y cualquier runtime compatible con GGUF que soporte `TQ2_0`. No se menciona soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Tractorman/bitnet-b1.58-2B-4T-TQ2_0-GGUF | 2,41B | no disponible | TQ2_0 + Q8_0 | MIT | GGUF |
| microsoft/bitnet-b1.58-2B-4T (original) | 2,41B | no disponible | pesos ternarios nativos | MIT | safetensors |
| BitNet b1.58 en bitnet.cpp (I2_S) | 2,41B | no disponible | I2_S | MIT | formato bitnet.cpp |
| Llama 3.2 1B / 3B (referencia de tamano) | 1B / 3B | 128K | Q4_K_M, Q8_0, etc. | Llama 3.2 Community License | GGUF, safetensors |

La comparativa se limita a variantes del mismo modelo base y a un referente de tamano similar; no se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un llama.cpp modificado: el llama.cpp estandar ignora `bitnet.hidden_activation = relu2` y aplica SiLU, lo que produce salidas incorrectas. Es imprescindible parchear `src/models/bitnet.cpp` (una linea) o usar un fork que lo soporte.
- No es compatible con bitnet.cpp: el tipo `TQ2_0` no es el `I2_S` de bitnet.cpp, por lo que no se puede cargar en ese runtime.
- Modelo de 2,4B: capacidad de razonamiento y conocimiento limitada en comparacion con modelos de mayor tamano; riesgo de alucinacion en tareas abiertas.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles u otros idiomas mayoritarios del tokenizador Llama 3.
- Contexto no documentado: se desconoce la longitud maxima de contexto efectiva.
- Sin benchmarks publicados: no hay datos objetivos de MMLU, HumanEval, GSM8K ni similares para esta version cuantizada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; el modelo base es de Microsoft y conserva su licencia MIT.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni retroalimentacion sobre su funcionamiento.
- La cuantizacion Q8_0 en embeddings y capa de salida introduce un error pequeno pero no nulo respecto al modelo original en F16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tractorman/bitnet-b1.58-2B-4T-TQ2_0-GGUF
- Modelo base: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
- Commit del modelo base referenciado: `04c3b9ad9361b824064a1f25ea60a8be9599b127`
- llama.cpp: https://github.com/ggerganov/llama.cpp
- bitnet.cpp: https://github.com/microsoft/BitNet
- Paper de BitNet b1.58: no disponible en la informacion proporcionada.
