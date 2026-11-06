# SynhalaAI/KanAI-Gemma4-E2B-Audio

## Resumen

KanAI-Gemma4-E2B-Audio es un ajuste fino (fine-tune) del modelo Gemma 4 E2B en su variante instructiva cuantizada a 4 bits publicada por Unsloth, desarrollado por SynhalaAI. El modelo se distribuye con pipeline `image-text-to-text` y la etiqueta `gemma4`, lo que indica que hereda la arquitectura multimodal de la familia Gemma 4 y que el ajuste se ha orientado a tareas que combinan imagen, texto y, segun el nombre del repositorio, audio. El identificador "E2B" sugiere una variante de eficiencia de la familia Gemma 4, aunque la informacion disponible no detalla su significado exacto.

El modelo cuenta con 5.123.178.051 parametros segun los pesos en safetensors y un repositorio de 25,4 GB, coherente con un checkpoint multimodal de ese tamano. Los idiomas declarados son ingles (en) y sinhala (si), lo que apunta a un ajuste orientado a la comunidad sinhala parlante, probablemente con enfasis en transcripcion o comprension de audio en ese idioma. Es relevante ahora porque combina un modelo base reciente de Google con tecnicas de cuantizacion de Unsloth y un ajuste comunitario para un idioma de bajos recursos.

El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. No se ha publicado informacion sobre licencia, datos de entrenamiento ni resultados de benchmarks, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base es una variante bnb-4bit; los pesos publicados estan en safetensors (precision exacta no disponible) |
| Idiomas soportados | Ingles (en), sinhala (si) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo deriva de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, es decir, una version instructiva de Gemma 4 E2B cuantizada a 4 bits con las optimizaciones de Unsloth. La etiqueta `gemma4` y el pipeline `image-text-to-text` confirman que se trata de un transformer multimodal con entrada de imagen y texto; el sufijo "Audio" del nombre del repositorio indica que el ajuste incorpora capacidades de audio, aunque la informacion disponible no especifica si se anadio un encoder de audio, si se reutilizo el de la familia Gemma o si el ajuste se limita a datos de audio transcritos a texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas del ajuste. La combinacion de un base cuantizado a 4 bits con un fine-tune sugiere un flujo de entrenamiento con QLoRA o tecnicas equivalentes de bajo rango, habituales en el ecosistema Unsloth, pero esto no esta confirmado en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del base instructivo Gemma 4 E2B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con capacidad de responder preguntas sobre imagenes.
- Procesamiento de audio segun el nombre del repositorio y el ajuste declarado; el alcance exacto (transcripcion, comprension, traduccion) no esta documentado.
- Soporte de ingles y sinhala como idiomas declarados.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion y comprension de audio en sinhala: el ajuste parece orientado a este idioma, por lo que puede emplearse para convertir grabaciones de voz en texto o para responder preguntas sobre contenido hablado, aprovechando la ventana multimodal del base.
- Asistentes de voz para comunidades sinhala parlantes: integrado en un pipeline de ASR mas LLM, el modelo puede gestionar consultas habladas y responder en texto, cubriendo un nicho poco atendido por los modelos comerciales.
- Descripcion de imagenes con contexto hablado: al combinar imagen, texto y audio, puede usarse en aplicaciones de accesibilidad que describan escenas a partir de una foto y una pregunta dictada por el usuario.
- Atencion al cliente en ingles y sinhala: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, aunque la longitud de contexto no esta documentada y deberia validarse antes de desplegarlo en produccion.
- Prototipado rapido en investigacion multimodal: al estar cuantizado a 4 bits y ocupar 25,4 GB en el repositorio, es adecuado para experimentos de ajuste e inferencia en entornos con una sola GPU de gama alta.
- Educacion y traduccion asistida: puede emplearse para generar material didactico o traducciones entre ingles y sinhala a partir de entradas de texto e imagen, con revision humana dado el riesgo de alucinacion.
- Procesamiento de documentos escaneados con audio: en flujos donde se recibe una imagen de un documento y una nota de voz asociada, el modelo puede combinar ambas modalidades para extraer o resumir informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123.178.051 parametros, en FP16 se requieren aproximadamente 10,2 GB solo para pesos; en 8 bits, unos 5,1 GB; en 4 bits, unos 2,6 GB. A esto hay que sumar la memoria del encoder multimodal, la cache KV y el overhead del runtime, por lo que en la practica conviene reservar entre 8 y 16 GB adicionales segun la longitud de contexto.
- GPU recomendadas: A100 de 40 u 80 GB, H100, L40S o RTX 6000 Ada para despliegues de produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion agresiva y contexto corto; en GPUs de 8 GB es probable que no quepa con el encoder multimodal completo.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si el soporte de Gemma 4 esta disponible en la version utilizada), llama.cpp y Ollama solo si existe una conversion GGUF publicada, que no se menciona en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SynhalaAI/KanAI-Gemma4-E2B-Audio | 5.123.178.051 | no disponible | imagen, texto, audio (segun nombre) | no disponible | gated en Hugging Face |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | no disponible | no disponible | imagen, texto | no disponible | publico en Hugging Face |
| Gemma 4 E2B (base de Google) | no disponible | no disponible | imagen, texto | no disponible | publico en Hugging Face |

La comparativa se limita a las variantes de la misma familia porque la informacion disponible no permite identificar alternativas de otros desarrolladores con caracteristicas equivalentes en sinhala y audio.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face y disponer de un token de acceso para descargar los pesos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Gemma 4 y las condiciones del repositorio antes de cualquier despliegue productivo.
- Idiomas limitados a ingles y sinhala: el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: inherente a los modelos generativos, especialmente en tareas de audio y en idiomas de bajos recursos donde los datos de entrenamiento son escasos.
- Sesgos: no documentados, pero probables en un ajuste comunitario con datos no publicados; conviene auditar las salidas en contextos sensibles.
- Contexto no documentado: se desconoce la ventana maxima efectiva, lo que complica el diseno de aplicaciones con documentos largos o conversaciones extensas.
- Base cuantizada a 4 bits: el fine-tune parte de un checkpoint ya cuantizado, lo que puede limitar la precision numerica y la calidad final frente a un ajuste sobre pesos completos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que permita comparar con alternativas.
- Repositorio con pocas descargas (237) y cero likes: senal de adopcion muy baja, por lo que el soporte de la comunidad y la madurez del modelo son limitados.

## Enlaces

- Hugging Face: https://huggingface.co/SynhalaAI/KanAI-Gemma4-E2B-Audio
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth: https://huggingface.co/unsloth
