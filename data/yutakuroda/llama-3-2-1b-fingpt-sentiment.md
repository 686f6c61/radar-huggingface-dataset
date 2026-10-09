# Yutakuroda/llama-3.2-1b-fingpt-sentiment

## Resumen

`Yutakuroda/llama-3.2-1b-fingpt-sentiment` es un ajuste fino mediante QLoRA del modelo base `meta-llama/Llama-3.2-1B` (1.235.814.400 parametros) especializado en analisis de sentimiento financiero. El modelo ha sido entrenado sobre el dataset `FinGPT/fingpt-sentiment-train` y devuelve, ante una noticia o texto financiero, una etiqueta de sentimiento entre `negative`, `neutral` y `positive`. Se publica como adaptador LoRA en formato safetensors con licencia Apache 2.0.

El problema que resuelve es la clasificacion de sentimiento en el dominio financiero, donde los modelos genericos suelen fallar por el vocabulario tecnico y el tono particular de las noticias economicas. Al partir de un modelo de solo 1B de parametros, la inferencia es viable en hardware de consumo, lo que abarata su integracion en pipelines de monitorizacion de noticias o de senales de trading.

La relevancia actual radica en la tendencia a producir adaptadores pequenos y baratos que convierten modelos base generalistas en clasificadores de dominio especifico, evitando el coste de entrenar modelos grandes desde cero. El repositorio presenta un unico fine-tuning (1 epoca, learning rate 2e-4) y no incluye todavia datos de rendimiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.2 1B), ajustado mediante QLoRA |
| Parametros totales | 1.235.814.400 (modelo base); parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.2 1B declara 131.072 tokens |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) usada en entrenamiento; otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible en la model card (el modelo base Llama 3.2 1B declara oficialmente 8 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/QLoRA) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-1B`, un transformer decoder-only con las innovaciones habituales de la familia Llama 3: embeddings rotatorios (RoPE), normalizacion RMSNorm pre-normalizacion, activacion SwiGLU y atencion con consultas agrupadas (GQA). El ajuste se realiza con QLoRA, es decir, se congela el modelo base cuantizado a 4 bits en NF4 y se entrenan adaptadores de bajo rango con computo en bfloat16. El autor indica rango r=16 y alpha=32.

El entrenamiento se ejecuto durante 1 epoca con learning rate 2e-4 sobre el dataset `FinGPT/fingpt-sentiment-train`, orientado a clasificacion de sentimiento financiero. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, los modulos diana del LoRA ni si se aplicaron tecnicas adicionales de alineacion (RLHF, DPO). Tampoco se documenta el prompt de entrenamiento mas alla del ejemplo de uso incluido.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases: `negative`, `neutral`, `positive`.
- Generacion de texto autorregresiva: el modelo responde con una etiqueta breve tras el patron de instruccion.
- Procesamiento de noticias financieras economicas y titulares con vocabulario de mercado.
- Ejecucion en modo determinista mediante `do_sample=False`, util para clasificacion reproducible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no documentadas para el adaptador).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Clasificacion de titulares financieros en tiempo real: el modelo recibe una noticia y devuelve una etiqueta de sentimiento, integrable en un flujo de ingestion de noticias para etiquetar cientos de textos por minuto con un coste computacional minimo.
- Monitorizacion de sentimiento de mercado: agregar las etiquetas generadas sobre noticias de un valor concreto para construir un indice de sentimiento diario que alimente paneles de analistas.
- Filtrado previo en estrategias cuantitativas: usar la etiqueta de sentimiento como senal auxiliar o filtro en un pipeline de trading sistematico antes de aplicar modelos mas costosos.
- Moderacion y triaje de contenidos financieros: clasificar grandes volumenes de texto (foros, redes) para separar opiniones negativas que requieran revision manual.
- Analisis de sentimiento en informes y comunicados de resultados: procesar extractos de earnings calls o notas de prensa y resumir la tonalidad por seccion.
- Investigacion academica en NLP financiero: servir como baseline ligero y reproducible para comparar tecnicas de fine-tuning (LoRA frente a ajuste completo) sobre el dataset FinGPT.
- Etiquetado automatico de corpus: generar etiquetas de sentimiento a escala para preanotar datasets que despues se revisen manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 el modelo base de 1,24B requiere aproximadamente 2,5 GB de pesos mas memoria para el contexto; en 4-bit (NF4) se reduce a alrededor de 0,7-1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4; para despliegues de alta concurrencia, A100 o H100 (sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas de VRAM, e incluso en CPU mediante cuantizacion.
- Opciones de despliegue: transformers con PEFT (metodo documentado por el autor), llama.cpp/Ollama o vLLM/TGI previa fusion del adaptador con el modelo base y conversion a GGUF u otro formato.
- Latencia y throughput estimados: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yutakuroda/llama-3.2-1b-fingpt-sentiment | 1,24B + adaptador LoRA | No disponible (base: 131.072) | Sentimiento financiero | apache-2.0 | HuggingFace (0 descargas al publicar) |
| meta-llama/Llama-3.2-1B | 1,24B | 131.072 | Generacion general | Llama 3.2 Community License | HuggingFace |
| FinBERT (ProsusAI) | ~110M | 512 | Sentimiento financiero | No disponible en esta ficha | HuggingFace |
| FinGPT (modelos base) | Variable | Variable | Tareas financieras | Variable segun variante | HuggingFace / GitHub |

Nota: los datos de rendimiento comparado no estan disponibles en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador hereda los sesgos del modelo base y del dataset `FinGPT/fingpt-sentiment-train`; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: al ser un modelo generativo, la salida no esta restringida formalmente a las tres etiquetas esperadas, por lo que puede producir respuestas fuera del conjunto `negative/neutral/positive`.
- Limitaciones de contexto e idioma: la model card no especifica idiomas ni longitud de contexto del adaptador; el ajuste se realizo unicamente en el dominio financiero en ingles de forma probable, lo que reduce su generalizacion a otros dominios.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero el modelo base `meta-llama/Llama-3.2-1B` esta sujeto a la Llama 3.2 Community License, cuyos terminos deben respetarse en el uso comercial.
- Caveat de produccion: el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad; no hay benchmarks publicados.
- Entrenamiento minimo: solo 1 epoca y 1 ejecucion documentada, sin informacion sobre semilla, split de validacion ni metricas de evaluacion, lo que dificulta reproducir o confiar en su rendimiento.
- Uso financiero: las etiquetas de sentimiento no constituyen asesoramiento financiero y no deben usarse como unica senal en decisiones de inversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yutakuroda/llama-3.2-1b-fingpt-sentiment
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/FinGPT/fingpt-sentiment-train
