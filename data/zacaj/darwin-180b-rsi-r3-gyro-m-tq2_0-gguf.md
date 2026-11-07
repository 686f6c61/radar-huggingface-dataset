# zacaj/Darwin-180B-RSI-R3-Gyro-M-TQ2_0-GGUF

## Resumen

Darwin-180B-RSI-R3-Gyro-M-TQ2_0-GGUF es una cuantización GGUF en formato TQ2_0 de un modelo de 180 000 millones de parámetros denominado Darwin-180B-RSI, atribuido al desarrollador FINAL_Bench y distribuido en Hugging Face por el usuario zacaj. El modelo base se describe como multimodal (entrada de imagen y texto, salida de texto) y con una ventana de contexto de 262 144 tokens, según la información pública disponible. La licencia declarada es qwen-community-1.0, lo que vincula el linaje del modelo al ecosistema Qwen.

El interés de esta publicación no reside en el modelo original, sino en la cuantización: un GGUF de 2 bits (TQ2_0) que reduce los requisitos de memoria de ~432 GB en FP16 a un rango manejable en hardware de gama alta de consumo o de un solo acelerador profesional. Es, por tanto, una opción para experimentación e inferencia local de un modelo de escala 180B cuando no se dispone de un clúster multi-GPU.

No obstante, la información verificable es muy escasa: la model card no contiene documentación técnica, no hay resultados de benchmarks, no se especifican idiomas soportados ni pipeline, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Todo lo que sigue distingue explícitamente entre datos confirmados y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como multimodal imagen+texto a texto) |
| Parametros totales | 180B |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 262 144 tokens (según ficha de SAVRN del modelo base) |
| Tipos de cuantizacion | GGUF TQ2_0 (2 bits); el modelo base admite FP16 y 4 bits según SAVRN |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como "other" en los tags) |
| Formato de pesos | GGUF (cuantización TQ2_0); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. La ficha de SAVRN lo describe como modelo de imagen y texto a texto con 180B de parámetros y 262 144 tokens de contexto, pero no detalla si emplea un transformer denso, una mezcla de expertos (MoE) o una arquitectura híbrida, ni cuántos parámetros se activan por token. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias.

Respecto a la innovación técnica de esta publicación concreta, se limita a la cuantización: el sufijo TQ2_0 indica un esquema de cuantización ternaria o de muy baja precisión (2 bits) empaquetado en GGUF, orientado a minimizar el peso en disco y en memoria a costa de una pérdida de calidad que no está documentada por el autor. No hay información sobre calibración, grupos de cuantización ni métricas de degradación (perplejidad, benchmarks) publicadas en el repositorio.

## Capacidades

- Generación de texto a partir de entradas de texto, según la descripción del modelo base.
- Procesamiento de imágenes como entrada (image-to-text), según la ficha de SAVRN; no hay ejemplos ni validación en el repositorio.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Análisis de documentos extensos: con 262 144 tokens de contexto, el modelo podría ingerir informes, contratos o bases de código completas en una sola pasada; sin embargo, la cuantización a 2 bits hace recomendable validar la calidad antes de usarlo en producción.
- Experimentación local con modelos de escala 180B: la versión TQ2_0 permite cargar el modelo en un único acelerador profesional o en configuraciones multi-GPU de consumo, lo que facilita investigación y pruebas de concepto sin clúster.
- Prototipado de pipelines multimodales: al aceptar imagen y texto, sirve para explorar flujos de descripción de imágenes o extracción de información de capturas y documentos escaneados, siempre que se verifique la fidelidad de las respuestas.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la degradación de un modelo de 180B al pasar de FP16 a 2 bits en tareas concretas del equipo.
- Generación asistida en entornos con restricciones de red: al ser un GGUF ejecutable con llama.cpp, puede desplegarse en infraestructura on-premise sin dependencia de APIs externas.
- Docencia y formación: permite mostrar el comportamiento de modelos de gran escala y el impacto de la cuantización en un laboratorio con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~432 GB en FP16 para el modelo base; ~108 GB en 4 bits; la versión TQ2_0 (2 bits) debería situarse en torno a 45-55 GB, aunque el autor no publica la cifra exacta.
- GPU recomendadas: para FP16, 2x MI325X según SAVRN; para 4 bits, 1x MI300X; para TQ2_0, un único acelerador con 48-80 GB (A100 80GB, H100, MI300X) o combinaciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en una sola unidad; requeriría al menos 2-3 GPU de 24 GB en paralelo, con las limitaciones de reparto de capas de llama.cpp.
- Opciones de despliegue: llama.cpp y derivados (Ollama, llama-cpp-python) para GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que el modelo base en safetensors sería la vía para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3-Gyro-M-TQ2_0-GGUF | 180B | 262 144 | qwen-community-1.0 | GGUF TQ2_0 | Cuantización de 2 bits, sin benchmarks publicados |
| Darwin-180B-RSI-GGUF (mradermacher) | 180B | 262 144 | qwen-community-1.0 | GGUF (varias cuantizaciones) | Repositorio de cuantizaciones alternativo del mismo modelo base |
| Qwen (familia, modelo de referencia por licencia) | no disponible | no disponible | qwen-community-1.0 | safetensors, GGUF | Linaje declarado por la licencia; sin datos concretos del modelo emparentado |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no contiene documentación técnica: no hay instrucciones de uso, plantilla de chat, ni parámetros de generación recomendados.
- La cuantización a 2 bits (TQ2_0) implica una degradación de calidad no cuantificada; no se han publicado métricas de perplejidad ni comparativas frente a FP16.
- Riesgo elevado de alucinación y de errores factuales, agravado por la baja precisión de los pesos y por la ausencia de evaluaciones.
- No se confirman los idiomas soportados; el rendimiento en castellano es desconocido.
- La licencia qwen-community-1.0 impone condiciones adicionales al uso comercial; es necesario revisar el texto completo antes de desplegar el modelo en producción.
- El repositorio registra cero descargas y cero likes, y no hay evidencia de validación por parte de la comunidad.
- El pipeline no está declarado en Hugging Face, lo que impide confirmar el soporte multimodal desde la plataforma.
- El autor del repositorio (zacaj) no coincide con el desarrollador atribuido (FINAL_Bench), por lo que se trata de una redistribución no oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zacaj/Darwin-180B-RSI-R3-Gyro-M-TQ2_0-GGUF
- Cuantizaciones alternativas de mradermacher: https://huggingface.co/mradermacher/Darwin-180B-RSI-GGUF
- Ficha del modelo base en SAVRN: https://savrn.com/models/darwin-180b-rsi
- Texto de la licencia qwen-community-1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/LICENSE
