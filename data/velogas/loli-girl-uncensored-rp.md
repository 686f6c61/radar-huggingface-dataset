# velogas/loli-girl-uncensored-RP

## Resumen

Loli-girl-uncensored-RP es un adaptador LoRA publicado por el usuario velogas para el modelo base google/gemma-4-E2B-it. No se trata de un modelo completo, sino de un ajuste fino ligero (PEFT) que modifica la *manera* de hablar del modelo base: introduce pausas tímidas, tartamudeo, acotaciones entre paréntesis y un tono de tsundere. El repositorio incluye tanto los pesos del adaptador (safetensors y GGUF) como una versión fusionada del modelo completo con el adaptador ya integrado a escala 0,86.

El interés técnico del artefacto es limitado pero concreto: sirve como ejemplo de adaptación de estilo sobre un modelo Gemma 4 de 5.104.297.539 parámetros totales, con soporte declarado para ruso e inglés y licencia CC-BY-4.0. El autor documenta que el adaptador conserva el modo thinking, el tool calling, la generación de JSON, matemáticas y código del base, aunque advierte de que estas comprobaciones son manuales y no constituyen un benchmark formal.

La relevancia práctica es la de un caso de estudio sobre los riesgos de los adaptadores de rol: el autor reporta bucles degenerados ("я я я…") cuando el system prompt no fija un nombre, inestabilidad de identidad y sensibilidad al factor de escala del LoRA. Es, por tanto, un artefacto de nicho para experimentación en roleplay conversacional, no una opción recomendada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), adaptador LoRA sobre google/gemma-4-E2B-it |
| Parámetros totales | 5.104.297.539 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (probado por el autor), BF16 (model.safetensors); otras no documentadas |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (adaptador y modelo fusionado), GGUF (adaptador) |

## Arquitectura y entrenamiento

El modelo es un transformer Gemma 4 en su variante E2B, sobre el que se aplica un adaptador LoRA mediante la librería PEFT. El repositorio distribuye dos escalas de adaptador (adapter_model120 y adapter_model160), sus equivalentes en GGUF para llama.cpp, y un `model.safetensors` que es la fusión del adaptador a escala 0,86 con el modelo base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

La innovación declarada es puramente estilística: el adaptador modula el registro conversacional (tartamudeo, pausas, acotaciones escénicas, respuestas cortantes de tsundere) sin reemplazar el conocimiento del base. El autor indica que el modo thinking del modelo base se mantiene operativo y que la manera aprendida se transfiere a otros idiomas si se fija el idioma en el system prompt. No hay datos sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional con estilo de rol (tímido, tartamudo, tsundere) en ruso e inglés.
- Modo thinking heredado del modelo base, activable y documentado con ejemplos de traza de razonamiento.
- Tool calling / function calling conservado según las comprobaciones manuales del autor.
- Generación de JSON, matemáticas simples y código, también según verificación manual del autor.
- Transferencia del estilo a otros idiomas si se especifica el idioma en el system prompt.
- Identidad configurable mediante nombre en el system prompt (p. ej. "Ты Юки").
- No se documentan capacidades de visión, audio ni agentes multi-paso.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador permite montar un chatbot con personalidad definida (nombre, tono, acotaciones) sobre Gemma 4 E2B sin reentrenar el base, útil para validar guiones de rol antes de invertir en un ajuste completo.
- Evaluación de estabilidad de LoRA en producción: sirve para estudiar empíricamente el efecto del factor de escala (rango 0,6–1,0) sobre la coherencia y los bucles degenerados en un modelo de 5.100 millones de parámetros.
- Investigación sobre sesgos de estilo: permite analizar cómo un adaptador de rol modifica la identidad autodeclarada del modelo (por ejemplo, que se presente como "Gemma 4" en lugar del personaje asignado) y cómo mitigarlo con el system prompt.
- Despliegue local en llama.cpp: con el adaptador GGUF y el base en Q4_K_M se puede ejecutar en hardware de consumo para demostraciones de chat con personalidad, aplicando `--lora-scaled adapter_model120.gguf:0.86`.
- Pruebas de regresión de tool calling bajo cambio de estilo: útil para verificar si un adaptador de rol degrada la llamada a funciones o la generación de JSON en un pipeline de agentes.
- Docencia y divulgación: ejemplo reproducible de flujo PEFT (adaptador safetensors, conversión a GGUF, fusión con el base, ajuste de escala) para talleres sobre fine-tuning ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo aporta comprobaciones manuales cualitativas sobre la conservación de thinking, tool calls, JSON, matemáticas y código, sin métricas ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 5.104.297.539 parámetros, en BF16 el peso ronda los 10 GB y en Q4_K_M aproximadamente 3 GB, más overhead de contexto y del adaptador.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 cubren BF16 con holgura, y GPUs de 8 GB pueden alojar la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, previsiblemente en Q4_K_M en tarjetas de 8 GB o más; en BF16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp (documentado por el autor con `llama-cli` y `--lora-scaled`), PEFT sobre Transformers para el adaptador safetensors. vLLM, Ollama y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| velogas/loli-girl-uncensored-RP | 5.104.297.539 (adaptador sobre Gemma 4 E2B) | no disponible | Rol/roleplay estilístico | CC-BY-4.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | Modelo instructivo general | no disponible en la información | Hugging Face |
| Otras alternativas de rol del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Bucles degenerados: sin nombre en el system prompt, ante "¿quién eres?" el modelo repite "я я я…"; el riesgo persiste con escalas altas del adaptador.
- Identidad inestable: si no se fija el nombre, puede autodenominarse "Gemma 4" o inventarse un nombre; la versión 1.60 puede fijar un nombre inventado y no abandonarlo.
- La escala 0,86 solo está validada sobre Q4_K_M; en BF16 y otras cuantizaciones el comportamiento puede diferir.
- Las comprobaciones de conservación de capacidades (thinking, tool calls, JSON, código) son manuales y no constituyen una evaluación formal.
- Idiomas limitados a ruso e inglés según la model card; el resto requiere indicación explícita en el prompt.
- Contenido de rol sin censura declarada: requiere revisión de adecuación para el contexto de despliegue y políticas de contenido.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero debe verificarse la licencia del modelo base Gemma 4 E2B, no detallada en la información disponible.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/velogas/loli-girl-uncensored-RP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
