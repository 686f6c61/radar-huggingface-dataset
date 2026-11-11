# Xinyueee/review-ai-detector

## Resumen

Review AI detector es un clasificador de texto basado en DistilBERT (`distilbert-base-uncased`) afinado para distinguir resenas reales de hoteles de Chicago de resenas generadas por modelos de lenguaje. Lo desarrolla el usuario Xinyueee en el marco de un trabajo de curso (CSE 594) y se publica como un modelo ONNX cuantizado de aproximadamente 0,1 GB, con licencia MIT y etiqueta de pipeline `text-classification`.

El modelo resuelve un problema acotado: la deteccion de opiniones sinteticas en un corpus concreto (Deceptive Opinion Spam Corpus de Ott et al.), donde la etiqueta 1 indica texto generado por IA. Se entreno con resenas producidas por Qwen3.8-27B y gpt-oss-120b, y se evaluo con resenas de Claude Opus 5.5, un generador no visto durante el entrenamiento, alcanzando un 86,25 % de exactitud sobre un conjunto de estudio de 400 resenas.

Es relevante por su caracter de experimento controlado de deteccion de texto generado y por su formato ligero (ONNX + DistilBERT), que permite desplegarlo en entornos con recursos limitados. El propio autor advierte de que no es un detector de texto IA de proposito general, sino una herramienta de investigacion ligada a un dominio y a un conjunto de generadores especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | no disponible (DistilBERT-base tiene aproximadamente 66 millones; el autor no lo indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens (longitud maxima usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; el detalle de cuantizacion no se especifica) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB); no se indica si hay safetensors o GGUF |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas destilado de BERT-base, y se afina como clasificador binario de secuencias. La cabeza de clasificacion produce dos etiquetas, donde 1 corresponde a resena generada por IA y 0 a resena humana. La longitud maxima de secuencia durante el entrenamiento fue de 384 tokens.

El entrenamiento se realizo durante 3 epocas con tasa de aprendizaje 3e-5 y tamano de lote 16. Los datos positivos (texto IA) se generaron con Qwen3.8-27B y gpt-oss-120b; los negativos son resenas veridicas del Deceptive Opinion Spam Corpus de Ott et al. (hoteles de Chicago). No se documenta el volumen total de ejemplos, la composicion exacta del dataset ni el uso de RLHF, DPO u otras tecnicas de alineacion. La evaluacion de generalizacion se hizo con resenas de Claude Opus 5.5, generador ausente del entrenamiento.

## Capacidades

- Clasificacion binaria de texto: distingue resenas humanas de resenas generadas por IA en el dominio de opiniones de hoteles.
- Especializacion en texto en ingles de resenas de hotel (dominio y genero acotados).
- Inferencia ligera en formato ONNX, apta para CPU y entornos con poca memoria.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Moderacion de resenas en plataformas de viajes: el modelo puede puntuar resenas de hoteles y marcar como sospechosas las que presenten patrones de generacion sintetica, usando la salida probabilistica como senal de triaje previo a revision humana.
- Investigacion sobre deteccion de texto generado: sirve como linea base reproducible (DistilBERT afinado) para comparar con detectores mas grandes o con tecnicas de watermarking en estudios academicos.
- Filtrado en pipelines de curación de datos: permite descartar resenas sinteticas al construir corpus de opiniones para entrenar otros modelos, siempre dentro del dominio de resenas de hotel en ingles.
- Auditoria de estudios humano-IA: el modelo se uso en un estudio de clase para etiquetar resenas generadas por distintos modelos y medir la capacidad humana de distinguirlas.
- Prototipado rapido en entornos con recursos limitados: al ser ONNX y de 0,1 GB, puede desplegarse en CPU o en dispositivos edge para demos y pruebas de concepto.
- Evaluacion de robustez entre generadores: permite medir como varia la deteccion cuando el texto proviene de modelos no vistos en entrenamiento (caso Claude Opus 5.5, 86,25 % de exactitud en 400 resenas).

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| Estudio con resenas de Claude Opus 5.5 (400 resenas, generador no visto) | Exactitud | 86,25 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un modelo DistilBERT-base; en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 1-2 GB de memoria (GTX 1050, RTX 3060, etc.) es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en Raspberry Pi o entornos serverless de baja memoria.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), y en general cualquier runtime compatible con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xinyueee/review-ai-detector | no disponible (DistilBERT-base) | 384 tokens | Deteccion de resenas IA en dominio hotelero | MIT | Hugging Face (ONNX) |
| distilbert-base-uncased | aproximadamente 66 M | 512 tokens | Modelo base general (no detector) | Apache 2.0 | Hugging Face |
| Detectores de texto IA de proposito general (p. ej. OpenAI AI Text Classifier, RoFT) | no disponible | no disponible | Deteccion generica multilingue | variable | retirados o de acceso restringido |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que no es un detector de texto IA de proposito general; su uso fuera del dominio de resenas de hotel en ingles no esta validado.
- Entrenado solo con resenas generadas por Qwen3.8-27B y gpt-oss-120b; la deteccion de otros generadores puede degradarse (el 86,25 % con Claude Opus 5.5 es el unico dato de generalizacion disponible).
- Riesgo de falsos positivos sobre resenas humanas con estilo repetitivo o muy formal, y de falsos negativos sobre texto IA editado o parafraseado.
- Sesgos potenciales derivados del corpus de origen (hoteles de Chicago, resenas veridicas de Ott et al.) que no se han auditado.
- Solo soporta ingles; no hay evaluacion multilingue.
- Licencia MIT permite uso comercial, pero el modelo es un artefacto de trabajo de curso sin garantias de robustez en produccion.
- El repo no documenta el volumen de entrenamiento, la composicion exacta del dataset ni los detalles de cuantizacion ONNX, lo que dificulta la reproducibilidad.
- Uso recomendado como senal de triaje con supervision humana, no como decision automatica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xinyueee/review-ai-detector
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Deceptive Opinion Spam Corpus (Ott et al.): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
