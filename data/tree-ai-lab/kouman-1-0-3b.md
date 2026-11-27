# Tree-AI-lab/kouman-1.0-3B

## Resumen

Kouman 1.0 3B es un modelo de lenguaje conversacional cuadrilingüe desarrollado por Tree AI Lab, un laboratorio con sede en Costa de Marfil. Está diseñado específicamente para cubrir el baoulé (bci) y el dioula (dyu), dos lenguas africanas de la familia lingüística nigerocongolesa habladas principalmente en Costa de Marfil, junto con francés e inglés como lenguas de apoyo. El modelo resuelve un problema de escasez de recursos: la práctica totalidad de los LLM disponibles comerciales o abiertos tienen una cobertura testimonial o nula de estas lenguas, lo que limita su uso en contextos educativos, administrativos y de preservación lingüística en la región.

Con 2.614 millones de parámetros reales (etiquetado comercialmente como "3B"), el modelo se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`) y una implementación de atención `eager`. La model card reporta un `val_loss` de 1.0224 en la fase SFT V4.3 y una identidad conversacional reforzada, orientada a mantener coherencia multi-turno y un tono pedagógico en dioula.

Su relevancia actual radica en que es uno de los pocos artefactos abiertos con evaluación publicada en MMLU-Baoulé, FLORES-200 Dioula y pruebas de teclado real, lo que permite comparar su rendimiento frente a modelos generalistas como Llama 3.2 1B-IT o Qwen 2.5 1.5B-IT en tareas específicas de estas lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles; requiere `trust_remote_code=True`) |
| Parametros totales | 2.614.341.888 (~2,6 B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible explícitamente; el ejemplo de la model card usa `config.max_position_embeddings` en tiempo de ejecución |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en el ejemplo de inferencia) |
| Idiomas soportados | baoulé (bci), dioula (dyu), francés (fr), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer decoder-only para generación de texto, con plantilla de chat propia (`apply_chat_template`) y token de fin de turno `<end_of_turn>`. El modelo requiere `attn_implementation='eager'` y código personalizado, lo que sugiere modificaciones sobre una arquitectura base no declarada por el autor. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La model card sí aporta dos datos concretos del proceso de ajuste: una fase de SFT (supervised fine-tuning) identificada como "V4.3" con `val_loss` de 1.0224, y un énfasis explícito en "alineamiento multi-turno reforzado" y "dioula pedagógico extendido". Esto indica un trabajo de curación de datos conversacionales y de instrucciones en dioula con fines educativos, aunque no se detalla la metodología ni el volumen de datos empleado.

## Capacidades

- Generación de texto conversacional multi-turno en baoulé, dioula, francés e inglés.
- Identidad conversacional estable: el modelo mantiene un rol definido a lo largo de la conversación.
- Contenido pedagógico en dioula, orientado a la enseñanza de la lengua.
- Comprensión y generación en las cuatro lenguas declaradas, con plantilla de chat propia.
- Traducción bidireccional francés↔dioula y francés↔baoulé (evaluada en FLORES-200 y en un conjunto OOD propio).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking, visión o audio: no disponible en la información.

## Casos de uso

- Atención al cliente en Costa de Marfil: el modelo puede gestionar conversaciones multi-turno en dioula o baoulé con clientes que no dominan el francés, usando la plantilla de chat y el token `<end_of_turn>` para delimitar turnos.
- Traducción francés↔dioula en servicios públicos: con chrF++ de 18,39 (FR→DYU) y 16,37 (DYU→FR) en FLORES-200, es adecuado para borradores y pre-traducción con revisión humana, no para publicación directa.
- Herramienta educativa de dioula: el ajuste "pedagógico extendido" permite usarlo como asistente de aprendizaje de vocabulario, frases y explicaciones gramaticales en dioula.
- Preservación y digitalización lingüística: generación de textos, resúmenes y material divulgativo en baoulé y dioula, lenguas con escasa representación digital.
- Asistente conversacional local en hardware modesto: con ~2,6 B parámetros y pesos en bfloat16 (repo de 5,3 GB), puede desplegarse en una GPU de consumo de 16-24 GB, útil para ONGs y centros educativos con infraestructura limitada.
- Prototipado de aplicaciones de voz o chat para mercados regionales: al cubrir cuatro lenguas en un único modelo, simplifica la integración frente a pipelines con varios modelos especializados.
- Investigación en LLM de bajos recursos: sirve como línea base reproducible para experimentos de ajuste fino y evaluación en lenguas africanas, dado que publica sus resultados en MMLU-Baoulé y FLORES-200 Dioula.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre el mismo GPU y los mismos prompts):

| Modelo | Params (M) | MMLU-Baoulé (%) | MMLU-FR (%) | ARC-Easy (%) | FLORES FR→DYU (chrF++) | FLORES DYU→FR (chrF++) | OOD FR→BCI (chrF++) | OOD BCI→FR (chrF++) | Maison CI & Clavier (%) | Score África/CI | Velocidad (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Kouman 1.0 3B | 2614 | 26,67 | 29,00 | 64,33 | 18,39 | 16,37 | 35,81 | 33,15 | 96,9 | 49,41 | 33,2 |
| Kouman AI 1.8 | 2614 | 26,00 | 30,00 | 64,00 | 18,31 | 18,34 | 39,49 | 33,81 | 90,6 | 47,53 | 35,5 |
| Llama 3.2 1B-IT | 1236 | 25,33 | 29,33 | 65,33 | 9,70 | 9,15 | 8,56 | 10,99 | 62,5 | 32,24 | 86,1 |
| Qwen 2.5 1.5B-IT | 1544 | 29,33 | 34,33 | 76,67 | 12,42 | 11,98 | 13,24 | 14,30 | 37,5 | 26,60 | 57,5 |

Lectura de los datos: Kouman 1.0 3B lidera en el benchmark propio "Maison CI & Clavier" (96,9 % frente a 62,5 % de Llama 3.2 1B y 37,5 % de Qwen 2.5 1.5B), en FLORES Dioula en ambas direcciones y en el conjunto OOD baoulé. En cambio, queda por debajo de Qwen 2.5 1.5B en MMLU-Francés (29,00 vs 34,33) y ARC-Easy (64,33 vs 76,67), y su velocidad de generación (33,2 tok/s) es la más baja de la comparativa.

## Requisitos de hardware

- VRAM estimada: ~5,3 GB en bfloat16 para pesos; en la práctica, 8-10 GB para inferencia con caché KV moderada. Con cuantización de 8 bits podría rondar los 3-4 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de producción con concurrencia; RTX 4090 (24 GB) para desarrollo y pruebas.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y, presumiblemente, en GPUs de 12-16 GB con cuantización, aunque no se ofrecen ficheros GGUF oficiales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `attn_implementation='eager'` (único método documentado); el script `inference_kouman.py` incluido en el repo facilita la puesta en marcha. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (el código personalizado y la atención eager pueden complicar la integración con estos motores).
- Latencia y throughput: 33,2 tok/s medidos por el autor en su GPU de referencia, el valor más bajo de la comparativa publicada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MMLU-Baoulé | FLORES FR→DYU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kouman 1.0 3B | 2,6 B | no disponible | 26,67 % | 18,39 chrF++ | no disponible | Hugging Face, safetensors |
| Kouman AI 1.8 | 2,6 B | no disponible | 26,00 % | 18,31 chrF++ | no disponible | Hugging Face (versión previa del mismo autor) |
| Llama 3.2 1B-IT | 1,24 B | 128 K (según ficha oficial de Meta) | 25,33 % | 9,70 chrF++ | Llama 3.2 Community License | Hugging Face, amplio ecosistema |
| Qwen 2.5 1.5B-IT | 1,54 B | 32 K (según ficha oficial de Alibaba) | 29,33 % | 12,42 chrF++ | Apache 2.0 | Hugging Face, amplio ecosistema |

Kouman 1.0 3B supera claramente a los modelos generalistas en tareas de baoulé y dioula, pero pierde en benchmarks generales en francés e inglés y en velocidad. Su ventaja es la especialización; su desventaja, la ausencia de licencia declarada y de ecosistema de cuantizaciones.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- `trust_remote_code=True` obligatorio: implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Riesgo de alucinación: con MMLU-Baoulé del 26,67 % y MMLU-Francés del 29,00 %, la precisión factual en conocimiento general es baja; no es fiable como fuente de datos sin verificación.
- Calidad de traducción moderada: chrF++ de 18,39 en FR→DYU y 16,37 en DYU→FR indica que las traducciones requieren revisión humana.
- Contexto no documentado: se desconoce la ventana máxima real, lo que complica el diseño de aplicaciones con documentos largos.
- Idiomas limitados: fuera de bci, dyu, fr y en no hay garantía de comportamiento correcto; el modelo no declara capacidades multilingües generales.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ publicados, lo que restringe el despliegue en hardware de gama baja.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad; en lenguas de bajos recursos los sesgos de los datos de ajuste pueden ser difíciles de detectar.
- Rendimiento generalista inferior: en ARC-Easy y MMLU-Francés queda por debajo de modelos más pequeños como Qwen 2.5 1.5B-IT, por lo que no sustituye a un modelo generalista en tareas no africanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-1.0-3B
- Tabla comparativa completa (referenciada en la model card): `assets/tableau_comparatif_kouman.csv`
- Gráfico de barras comparativo (referenciado): `assets/benchmark_comparatif_barres.png`
- Perfil radar de 6 ejes (referenciado): `assets/benchmark_comparatif_radar.png`
- Script de inferencia incluido en el repo: `inference_kouman.py`
- Paper, blog o demo adicionales: no disponible
