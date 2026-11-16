# willychenwii/pig-respiratory-ast

## Resumen

Pig respiratory AST es un modelo de clasificación de audio basado en la arquitectura Audio Spectrogram Transformer (AST), desarrollado por el autor willychenwii (Willy Chen) en colaboración con la Universidad Nacional de Pingtung (NPUST) y la Universidad Nacional de Taiwán (NTU). El modelo parte del checkpoint preentrenado MIT/ast-finetuned-audioset-10-10-0.4593 y se ha ajustado finamente sobre grabaciones de fonendoscopio de cerdos para detectar problemas respiratorios en entornos de granja.

El modelo resuelve un problema concreto de bioacústica aplicada a ganadería: la monitorización automática de la salud respiratoria porcina en condiciones de ruido ambiental. Con 86,19 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto que se distribuye como checkpoint exacto del artículo "Hybrid AST-XGBoost Architecture for Pig Respiratory Health Monitoring in Noisy Farm Environments" (Chen, Huang, Xu, Jang; en revisión en Computers and Electronics in Agriculture).

Es relevante porque demuestra el uso de transformers de audio en un dominio de nicho con datos limitados (16 cerdos de una única granja comercial) y porque su uso previsto no es la clasificación directa con la cabeza integrada, sino la extracción de características (embeddings de 768 dimensiones) para alimentar un clasificador XGBoost externo. Esto lo convierte en una pieza de una arquitectura híbrida más que en un clasificador autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer sobre espectrogramas de audio |
| Parametros totales | 86.191.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio fija según AST; valor exacto no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | MIT/ast-finetuned-audioset-10-10-0.4593 |
| Pipeline | audio-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un Audio Spectrogram Transformer, una arquitectura transformer pura que opera sobre espectrogramas de audio tratados como secuencias de parches, sin componentes convolucionales. Parte del checkpoint MIT/ast-finetuned-audioset-10-10-0.4593, preentrenado en AudioSet, y se ha ajustado finamente sobre grabaciones de fonendoscopio de cerdos.

El conjunto de entrenamiento proviene de 16 cerdos de una única granja comercial, en el marco de una colaboración entre NPUST y NTU. El ajuste fino produce un modelo que el autor describe explícitamente como extractor de características: la representación recomendada se obtiene promediando en el tiempo la media de las tres últimas capas ocultas (768 dimensiones), que se alimenta a una cabeza XGBoost externa. El clasificador integrado en el checkpoint no es el clasificador del artículo. Para reproducir los embeddings exactos del paper debe usarse `transformers==4.45.0`; con versiones más recientes la similitud coseno es de aproximadamente 0,98.

No se dispone de información sobre el número de tokens de audio, la composición detallada del dataset ni sobre el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de embeddings de audio de 768 dimensiones a partir de grabaciones de fonendoscopio de cerdos.
- Clasificación de audio en tres clases mediante la cabeza integrada: no-breathing (sin respiración), normal y abnormal (anormal), aunque el autor advierte que la cabeza integrada no es el clasificador del artículo.
- Procesamiento de audio en entornos ruidosos de granja, según el enfoque del artículo asociado.
- Uso como componente de una arquitectura híbrida AST + XGBoost.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al tratarse de un modelo de clasificación de audio.
- No se ha documentado soporte de visión, modo thinking ni audio generativo.

## Casos de uso

- Monitorización de salud respiratoria en granja: el modelo extrae embeddings de grabaciones de fonendoscopio y, combinado con la cabeza XGBoost del repositorio del autor, clasifica el estado respiratorio de cada animal para detectar casos anómalos de forma temprana.
- Investigación en bioacústica: sirve como extractor de características reproducible para experimentos que estudien la respiración porcina, con la ventaja de que el checkpoint exacto del paper está publicado y la reproducibilidad está documentada (transformers 4.45.0, coseno ≈ 0,98 en versiones posteriores).
- Integración en pipelines de visión por computador para ganadería: los embeddings de 768 dimensiones pueden alimentar clasificadores ligeros (XGBoost, regresión logística) adaptados a cada explotación sin reentrenar el transformer.
- Prototipado de sistemas de alerta temprana: al ser un modelo de 86 millones de parámetros y 0,3 GB, puede desplegarse en hardware modesto para pruebas de concepto en entornos de investigación o demo.
- Docencia y demostración de transferencia de aprendizaje en audio: ejemplo práctico de ajuste fino de AST sobre un dominio de nicho con pocos sujetos (16 cerdos).
- Evaluación comparativa de arquitecturas híbridas: referencia para comparar el rendimiento de AST frente a otros extractores de audio en tareas de clasificación con datos limitados y ruido ambiental.

## Benchmarks y rendimiento

El autor reporta en la model card un macro F1 de 0,871 con validación cruzada anidada leave-one-pig-out (dejando un cerdo fuera en cada iteración) para la arquitectura completa AST + XGBoost. Este resultado corresponde al sistema híbrido descrito en el artículo, no a la cabeza de clasificación integrada en el checkpoint.

| Metrica | Valor | Condiciones |
|---|---|---|
| Macro F1 | 0,871 | Validación cruzada anidada leave-one-pig-out, sistema AST + XGBoost |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,35 GB solo para pesos, más memoria para activaciones y espectrogramas; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 2080 o superiores no suponen ninguna restricción.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060 y superiores).
- También puede ejecutarse en CPU para inferencia por lotes, dado el reducido tamaño del modelo.
- Opciones de despliegue: transformers (con `transformers==4.45.0` para reproducibilidad exacta), y en principio cualquier runtime compatible con safetensors y AST; no se ha documentado soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| willychenwii/pig-respiratory-ast | 86,19 M | no disponible | Clasificación de audio respiratorio porcino | MIT | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | no disponible en la información | no disponible | Clasificación de audio general (AudioSet) | no disponible en la información | Hugging Face |
| AST original (Gong et al.) | no disponible en la información | no disponible | Clasificación de audio general | no disponible en la información | Paper y checkpoints públicos |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a la relación de derivación: pig-respiratory-ast es un ajuste fino del checkpoint MIT/ast-finetuned-audioset-10-10-0.4593, que a su vez deriva de la arquitectura AST original.

## Limitaciones y advertencias

- El modelo se distribuye para uso exclusivo de investigación y demostración; no es una herramienta de diagnóstico veterinario.
- El conjunto de entrenamiento es muy reducido: 16 cerdos de una única granja comercial, lo que limita la generalización a otras granjas, razas, edades o condiciones de grabación.
- El autor advierte que la clase "abnormal" puede estar parcialmente confundida con la configuración de grabación, lo que introduce un riesgo de sesgo sistemático en las predicciones.
- La cabeza de clasificación integrada en el checkpoint no es el clasificador del artículo; usarla directamente no reproduce los resultados publicados.
- Para reproducir los embeddings del paper es necesario usar `transformers==4.45.0`; con versiones posteriores la similitud coseno cae a aproximadamente 0,98, lo que puede alterar resultados en pipelines sensibles.
- No se han documentado sesgos adicionales, riesgos de alucinación (no aplica a un clasificador) ni limitaciones idiomáticas.
- La licencia MIT permite uso comercial, pero las advertencias del autor sobre el uso previsto (investigación y demo, no diagnóstico) deben respetarse en cualquier despliegue en producción.
- No hay información sobre el rendimiento del modelo fuera del dominio de validación leave-one-pig-out reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willychenwii/pig-respiratory-ast
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Repositorio del pipeline AST + XGBoost: https://github.com/Willy-chen/pig-respiratory-monitor
- Artículo asociado: "Hybrid AST-XGBoost Architecture for Pig Respiratory Health Monitoring in Noisy Farm Environments" (Chen, Huang, Xu, Jang; en revisión en Computers and Electronics in Agriculture)
