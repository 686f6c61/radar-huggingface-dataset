# znaat/modernbert-coreml

## Resumen

`znaat/modernbert-coreml` es una conversión a Core ML del modelo encoder `answerdotai/ModernBERT-base`, realizada por el usuario znaat. Incluye la cabeza de masked language modeling (fill-mask) y está fijada a una longitud de secuencia de 64 tokens. El objetivo es ofrecer una alternativa nativa para Apple Silicon (M-series) que ejecute ModernBERT de forma eficiente, con una latencia de aproximadamente 7 ms por llamada tras el calentamiento, frente a los ~55 ms del mismo modelo en PyTorch en la misma máquina.

La conversión está verificada contra el modelo PyTorch original: la correlación de logits en una posición enmascarada es de 0.9964 a 1.0000 en cuatro frases de prueba. El autor advierte explícitamente de que una conversión anterior publicada en el Hub (finnvoorhees/ModernBERT-CoreML) produce resultados incorrectos a longitudes reales, y este repositorio nace precisamente para documentar y evitar ese fallo silencioso.

El modelo se distribuye bajo licencia Apache-2.0, solo en inglés, y está pensado para tareas de enmascaramiento y representación de texto en entornos Apple. No es un modelo generativo ni multimodal; es un encoder clásico adaptado al ecosistema Core ML.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) convertido a Core ML |
| Parametros totales | 149M (modelo base ModernBERT-base, segun el blog de Answer.ai) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Fija a 64 tokens (la conversion no admite longitudes variables) |
| Tipos de cuantizacion | Float (FP32), int8, int4 (medidos en build de 128, no fiel) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (mlpackage) |

## Arquitectura y entrenamiento

El modelo base, ModernBERT-base, es un encoder-only de 149 millones de parametros con atencion de ventana deslizante y una longitud de contexto nativa de 8192 tokens. Fue entrenado por AnswerDotAI con tecnicas modernas de escalado y una arquitectura modular (FlexBERT) que permite configuraciones flexibles mediante ficheros YAML. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineamiento (RLHF/DPO) en la informacion proporcionada.

La conversion a Core ML se realizo con `coremltools==9.0` y `transformers==4.48.3`, fijando la longitud de secuencia a 64. El autor advierte que con `transformers` 5.x la conversion falla porque se emite `new_ones` en la ruta de atencion, un problema que tambien afecta a BERT y DistilBERT. La conversion no modifica los pesos; solo adapta el grafo a Core ML. La verificacion se hace comparando los logits con el modelo PyTorch original mediante el script `verify.py`.

## Capacidades

- Enmascaramiento de tokens (fill-mask): predice la palabra enmascarada en una secuencia de texto.
- Representacion de texto: genera embeddings contextuales utiles para tareas downstream como clasificacion, NER o similaridad semantica.
- Ejecucion nativa en Apple Silicon: aprovecha el Neural Engine y la GPU de los chips M-series.
- Inferencia rapida: ~7 ms por llamada tras el calentamiento, frente a ~55 ms en PyTorch en la misma maquina.
- No soporta tool calling, agentes, ni razonamiento multi-paso; es un modelo encoder puro.
- No es multimodal; solo procesa texto en ingles.

## Casos de uso

- Clasificacion de texto en apps iOS/macOS: el modelo puede usarse como backbone para tareas de sentimiento, spam o categorizacion, ejecutandose localmente en el dispositivo sin conexion.
- Extraccion de entidades (NER): al ser un encoder, puede alimentar un clasificador de etiquetas por token para identificar personas, lugares u organizaciones en texto.
- Busqueda semantica en el dispositivo: los embeddings generados permiten indexar documentos y hacer busquedas por similaridad sin enviar datos a la nube.
- Autocompletado de texto en editores: la cabeza de masked-LM puede sugerir palabras en medio de una frase, util en aplicaciones de escritura asistida.
- Preprocesamiento para modelos generativos: se puede usar para generar representaciones de contexto que luego se pasan a un modelo de lenguaje mas grande.
- Verificacion de calidad de conversiones Core ML: el script `verify.py` sirve como referencia para comprobar que otras conversiones de ModernBERT mantienen la fidelidad a longitudes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) para esta conversion. La informacion disponible se limita a la verificacion de fidelidad y a mediciones de latencia y tamano:

| Metrica | Valor |
|---|---|
| Correlacion de logits (longitud 64) | 0.9964 a 1.0000 en cuatro frases |
| Correlacion de logits (longitud 128) | 0.90 a 0.99 en las mismas frases |
| Latencia (float, longitud 64) | ~7 ms por llamada tras warm-up |
| Latencia (float, longitud 128) | ~10 ms (build no fiel) |
| Latencia (int8, longitud 128) | ~23 ms (build no fiel) |
| Latencia (int4, longitud 128) | ~21 ms (build no fiel) |
| Tamano (float) | 286 MB |
| Tamano (int8) | 152 MB |
| Tamano (int4) | 81 MB |

Los datos de cuantizacion provienen de un build de longitud 128 que posteriormente se descubrio que no era fiel, por lo que el autor los presenta como una direccion, no como una medicion definitiva.

## Requisitos de hardware

- Mac con chip Apple Silicon (M1 o superior) o dispositivo iOS con Neural Engine.
- No requiere GPU dedicada; Core ML utiliza el Neural Engine y la GPU integrada.
- VRAM: no aplica en el sentido clasico; la memoria unificada del chip M-series es suficiente (el modelo float ocupa 286 MB).
- Primera llamada: ~7 segundos de compilacion Core ML, por lo que se recomienda calentar el modelo al arrancar la aplicacion.
- Despliegue: se integra directamente en apps Xcode mediante Core ML, o en Python con `coremltools`.
- No es compatible con vLLM, llama.cpp u Ollama, ya que son entornos para modelos generativos y no soportan Core ML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Fidelidad | Licencia |
|---|---|---|---|---|---|
| znaat/modernbert-coreml | 149M | 64 fijo | Core ML | Verificada (0.9964-1.0000) | Apache-2.0 |
| finnvoorhees/ModernBERT-CoreML | 149M | Flexible (incorrecto) | Core ML | No verificada; correlacion 0.17-0.39 a longitudes reales | Apache-2.0 |
| answerdotai/ModernBERT-base (PyTorch) | 149M | 8192 | safetensors | Referencia | Apache-2.0 |

La conversion de finnvoorhees es la unica alternativa Core ML conocida, pero el autor de `znaat/modernbert-coreml` demuestra que produce resultados incorrectos a longitudes mayores de 1 token. El modelo original en PyTorch es la referencia, pero no es ejecutable en Apple Silicon sin conversion.

## Limitaciones y advertencias

- Longitud de secuencia fija a 64: no se puede procesar texto mas largo sin reconvertir el modelo, y la fidelidad cae notablemente a 128 (correlacion 0.90-0.99).
- El padding se atiende como texto real: la atencion se aplica a todos los tokens, incluidos los de relleno, lo que puede degradar resultados en tareas sensibles al contexto.
- No se puede pasar `attention_mask` como entrada real; el grafo usa `ones_like(input_ids)` internamente, y coremltools no soporta la conversion de `new_ones`.
- La cuantizacion int4 cambia la distribucion de los logits y empeora la calidad; int8 duplica la latencia porque los pesos se des-cuantizan en cada pasada.
- La conversion depende de una version especifica de `transformers` (4.48.3); con versiones 5.x falla la conversion.
- El modelo solo soporta ingles; no hay capacidades multilingues.
- No hay garantias de rendimiento en produccion: el autor solo ha verificado cuatro frases de ejemplo, no un conjunto de validacion amplio.
- La licencia Apache-2.0 permite uso comercial, pero la conversion no incluye el codigo de entrenamiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/znaat/modernbert-coreml
- Modelo base (ModernBERT-base): https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio de ModernBERT (AnswerDotAI): https://github.com/AnswerDotAI/ModernBERT
- Blog de presentacion de ModernBERT: https://www.answer.ai/posts/2024-12-19-modernbert.html
- Conversion anterior (finnvoorhees/ModernBERT-CoreML): https://huggingface.co/finnvoorhees/ModernBERT-CoreML
