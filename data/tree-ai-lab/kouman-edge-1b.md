# Tree-AI-lab/kouman-edge-1b

## Resumen

Kouman 1.0 Edge 1B es un modelo de lenguaje de 1.235.814.400 parámetros (aproximadamente 1,24B) desarrollado por Tree AI Lab, un laboratorio con sede en Costa de Marfil. Se construye mediante ajuste del modelo base meta-llama/Llama-3.2-1B y está diseñado específicamente para ejecutarse en dispositivos móviles y de forma totalmente offline (on-device). Su rasgo diferencial es la incorporación de dos lenguas minoritarias de Costa de Marfil: el baoulé (código ISO `bci`) y el dioula (`dyu`), junto con francés e inglés, lo que lo convierte en una propuesta poco habitual dentro del ecosistema de modelos pequeños.

El modelo se distribuye en dos formatos complementarios: pesos completos en `bfloat16` (safetensors) para uso con `transformers`, `vLLM` u `Ollama`, y una gama completa de cuantizaciones GGUF para `llama.cpp` que abarca desde `Q8_0` hasta `Q2_K`. Esta segunda vía es la que habilita el despliegue real en teléfonos Android e iOS con aplicaciones como PocketPal AI o ChatterUI, sin necesidad de conexión a internet.

Su relevancia actual radica en dos factores: por un lado, demuestra que un ajuste de dominio lingüístico sobre un modelo base pequeño puede reducir drásticamente la perplejidad en lenguas de bajos recursos (de 20,74 a 2,90 en baoulé según la model card); por otro, ofrece una receta de despliegue edge completa con cuantizaciones calibradas mediante `imatrix` multilingüe, algo que no es habitual en modelos orientados a lenguas africanas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) |
| Parámetros totales | 1.235.814.400 (≈1,24B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BF16 (safetensors), GGUF Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Baoulé (`bci`), dioula (`dyu`), francés (`fr`), inglés (`en`) |
| Licencia | Llama 3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (BF16), GGUF (llama.cpp), ONNX (según tags del repo) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 1B, un transformer decoder-only denso con atención causal estándar. Sobre esta base se aplicó un entrenamiento continuado de preentrenamiento (CPT, continued pre-training) de aproximadamente 1.700 millones de tokens distribuidos en 6.488 pasos con un scheduler de tipo WSD (warmup-stable-decay). No se especifica en la información disponible la composición exacta del corpus ni si se aplicaron fases posteriores de ajuste supervisado (SFT), RLHF o DPO, aunque la model card describe el resultado como "modelo Instruct", lo que sugiere al menos una fase de instrucción.

La innovación técnica más destacable es el uso de una `imatrix` (importance matrix) multilingüe de cuatro idiomas para calibrar las cuantizaciones GGUF. Esta técnica de calibración permite preservar el rendimiento en baoulé y dioula incluso en cuantizaciones agresivas de 3 y 4 bits, algo crítico cuando el objetivo es ejecutar el modelo en smartphones de gama media o entrada. Además, el repositorio incluye pesos en ONNX, lo que amplía las opciones de despliegue más allá de `llama.cpp` y `transformers`.

## Capacidades

- Generación de texto conversacional en baoulé, dioula, francés e inglés.
- Traducción entre los cuatro idiomas soportados, con especial énfasis en pares baoulé/francés y dioula/francés.
- Comprensión y generación en lenguas de bajos recursos con perplejidad reducida respecto al modelo base.
- Formato Instruct con plantilla de chat (`apply_chat_template`), apto para diálogo multi-turno.
- Ejecución offline en dispositivos móviles mediante GGUF y `llama.cpp`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo "thinking".

## Casos de uso

- Asistentes conversacionales offline en zonas rurales de Costa de Marfil: el modelo puede ejecutarse íntegramente en un smartphone Android de gama media con la cuantización `Q4_K_M` (770 MB), sin depender de conectividad, lo que resulta adecuado para regiones con cobertura intermitente.
- Traducción baoulé-francés y dioula-francés en aplicaciones de mensajería: la reducción de perplejidad documentada (de 20,74 a 2,90 en baoulé) lo hace viable para traducción asistida de frases cotidianas en entornos sanitarios, administrativos o educativos.
- Preservación y fomento de lenguas minoritarias: integración en aplicaciones educativas que generen ejercicios, cuentos o material didáctico en baoulé y dioula, contribuyendo a la digitalización de lenguas con escasa representación en corpus.
- Chatbots de atención al ciudadano en administraciones locales: al soportar francés e inglés junto con las lenguas locales, puede desplegarse en oficinas de atención presencial con hardware de bajo coste (un portátil o un mini-PC con CPU ARM).
- Integración en aplicaciones móviles de terceros mediante GGUF: desarrolladores pueden embeberlo en apps con `llama.cpp` o vía ONNX, usando la cuantización `Q3_K_M` (659 MB) para dispositivos con 4 GB de RAM.
- Prototipado e investigación en NLP de bajos recursos: sirve como punto de partida para experimentos de ajuste fino en otras lenguas africanas, dado que su licencia Llama 3.2 permite uso comercial bajo condiciones y el modelo base es ampliamente conocido.
- Despliegue en entornos sin nube por requisitos de privacidad: al ejecutarse on-device, los datos del usuario no salen del dispositivo, lo que encaja en contextos sanitarios o legales donde la confidencialidad es crítica.

## Benchmarks y rendimiento

La model card proporciona únicamente métricas de perplejidad (PPL) del entrenamiento continuado, no resultados en benchmarks estándar como MMLU, HumanEval o GSM8K:

| Idioma | Llama 3.2 1B base (PPL) | Kouman 1.0 Edge 1B (PPL) | Mejora |
|---|---:|---:|---:|
| Baoulé (`bci`) | 20,74 | 2,90 | −17,84 (÷7,2×) |
| Dioula (`dyu`) | 19,58 | 2,25 | −17,33 (÷8,7×) |
| Francés (`fr`) | 9,33 | 4,40 | −4,93 (sin olvido declarado) |
| Inglés (`en`) | 6,77 | 5,12 | −1,65 (sin olvido declarado) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,5 GB (pesos de 1,24B × 2 bytes más overhead de activaciones y KV cache).
- VRAM estimada en cuantizaciones GGUF: desde ~554 MB (`Q2_K`) hasta ~1,23 GB (`Q8_0`); la opción recomendada `Q4_K_M` ocupa 770 MB en disco y requiere alrededor de 1-1,5 GB de RAM en ejecución.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (RTX 3050, RTX 4060, T4); para GGUF basta CPU. En GPUs de datacenter (A100, H100) el modelo es sobredimensionado para su tamaño y no aprovecha su capacidad, por lo que no es el objetivo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPUs ARM modernas con NEON/i8mm.
- Opciones de despliegue: `llama.cpp` (CLI, servidor, bindings), `transformers`, `vLLM`, `Ollama`, aplicaciones móviles basadas en `llama.cpp` (PocketPal AI, ChatterUI) y ONNX Runtime.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible; en un smartphone moderno con `Q4_K_M` es esperable una generación en el orden de decenas de tokens por segundo, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|
| **Kouman 1.0 Edge 1B** | 1,24B | No disponible | bci, dyu, fr, en | Llama 3.2 | safetensors, GGUF, ONNX |
| Llama 3.2 1B (base) | 1,24B | 128K (según ficha oficial de Meta) | Multilingüe (8 oficiales) | Llama 3.2 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K nativo (128K con RoPE) | Multilingüe (29+) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6B | 8K | Multilingüe | Gemma Terms | safetensors, GGUF |

El modelo de Tree AI Lab se diferencia de los anteriores por su especialización en lenguas de Costa de Marfil, un nicho que ninguno de los comparables cubre. A cambio, su contexto no está documentado y su licencia (Llama 3.2) es más restrictiva que la Apache 2.0 de Qwen. Para tareas generales en inglés o francés, Llama 3.2 1B o Qwen2.5-1.5B probablemente igualen o superen su rendimiento; para baoulé y dioula, Kouman es la única opción identificada en esta comparativa.

## Limitaciones y advertencias

- El tamaño de 1,24B impone un techo claro de razonamiento: no es adecuado para tareas complejas de matemáticas, código o razonamiento multi-paso.
- Riesgo de alucinación elevado, especialmente en las lenguas de bajos recursos, donde el corpus de entrenamiento es necesariamente limitado y la verificación factual es difícil.
- La model card no documenta evaluación de sesgos; es esperable que herede sesgos del corpus Llama 3.2 y del corpus CPT, sin que se hayan publicado análisis al respecto.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligación de atribución, restricciones de uso aceptable) y no es una licencia de código abierto plena.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- La cuantización `Q2_K` se marca explícitamente como experimental y con degradación esperada en un modelo de 1B; el propio autor recomienda `Q3_K_M` o `Q4_K_M`.
- El rendimiento en francés e inglés, aunque declarado sin olvido, se mide solo por perplejidad, no por evaluaciones de instrucción o calidad conversacional.
- El repositorio ocupa 30,2 GB, lo que refleja la inclusión de múltiples formatos y cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-edge-1b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Repositorio de `llama.cpp`: https://github.com/ggerganov/llama.cpp
- Aplicación PocketPal AI: no disponible en la información proporcionada
- Aplicación ChatterUI: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
