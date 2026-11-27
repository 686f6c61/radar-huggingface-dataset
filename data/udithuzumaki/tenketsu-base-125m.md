# udithuzumaki/Tenketsu-Base-125M

## Resumen

Tenketsu-Base-125M es un modelo de lenguaje de 125,3 millones de parametros entrenado desde cero por un autor independiente (udithuzumaki) y publicado en Hugging Face. Se trata de un modelo base, no afinado para instrucciones ni para conversacion: su funcion es continuar texto, no responder preguntas ni seguir ordenes de forma fiable. El autor lo situa explicitamente en un nivel comparable a GPT-2 small, con ingles fluido en apariencia pero propenso a derivas y repeticiones.

La arquitectura es un transformer decoder-only de estilo Llama, con RMSNorm, RoPE, SwiGLU y atencion con query agrupadas (12 cabezas de query y 4 de clave/valor), 16 capas y dimension 768. Incorpora tokenizer propio byte-level BPE de 32.000 tokens y un contexto de 1.024 tokens. El entrenamiento se realizo sobre aproximadamente 2.570 millones de tokens procedentes de FineWeb-Edu (ingles), Wikipedia en hindi y telugu y codigo Python de codeparrot, con una mezcla aproximada del 79 % ingles, 8 % telugu, 6 % hindi y 7 % codigo.

Su relevancia es limitada pero clara: es un ejemplo reproducible de entrenamiento from scratch con hardware de consumo (una RTX 4050 de portatil de 6 GB y sesiones gratuitas de Kaggle con 2x T4), pesos publicados en formato compatible con `transformers`, llama.cpp y Ollama, y licencia Apache 2.0. Resulta util como material didactico, para experimentar con pipelines de inferencia o como punto de partida de investigacion, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 125.264.640 (embeddings de entrada y salida atados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF disponible en el repo; el autor no detalla los niveles concretos (no disponible) |
| Idiomas soportados | Ingles, hindi y telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sigue el diseno de Llama: 16 capas, dimension de modelo 768, 12 cabezas de atencion de query y 4 de clave/valor (GQA), normalizacion RMSNorm, embeddings rotatorios (RoPE) y activacion SwiGLU. El tokenizer es un BPE byte-level propio de 32.000 tokens. Los pesos se publican en el layout estandar de Llama para que puedan ejecutarse con `transformers`, llama.cpp y Ollama; el autor aclara que el layout esta convertido y que no deriva de ningun modelo de Meta ni se han usado pesos preentrenados.

El entrenamiento cubre unos 2.570 millones de tokens en 9.556 pasos de 262.144 tokens cada uno, con AdamW, tasa de aprendizaje coseno con pico de 6e-4 y precision mixta bf16/fp16. La mezcla de datos aproximada es 79 % ingles (FineWeb-Edu), 8 % telugu y 6 % hindi (Wikipedia) y 7 % codigo Python (codeparrot-clean). El hardware empleado fue una RTX 4050 de portatil con 6 GB y sesiones de 2x T4 en Kaggle. La perdida de validacion final reportada es 2,88 (perplejidad 17,7) sobre documentos reservados. No se menciona RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto por continuacion de prompt, en ingles principalmente.
- Capacidad basica de generacion de codigo Python, limitada por el 7 % de tokens de codigo en el entrenamiento.
- Cobertura multilingue parcial en hindi y telugu, con calidad reconocida como debil por el propio autor.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No esta afinado para instrucciones ni para dialogo.

## Casos de uso

- Material didactico de entrenamiento: sirve para estudiar el pipeline completo de un modelo from scratch (tokenizer propio, mezcla de datos, entrenamiento en hardware de consumo) y comparar decisiones de arquitectura con modelos de referencia.
- Pruebas de infraestructura de inferencia: al publicarse en safetensors y GGUF, permite validar despliegues con `transformers`, llama.cpp u Ollama sin coste de GPU significativo.
- Generacion de texto de relleno en entornos de prueba: util para poblar fixtures y tests de aplicaciones que consumen un endpoint de text-generation sin depender de APIs externas.
- Experimentos academicos de tokenizacion multilingue: el tokenizer de 32.000 tokens fragmenta las palabras indicas en cada signo vocálico (unos 1,5 caracteres por token), lo que lo convierte en un caso de estudio concreto sobre el impacto del tokenizer en lenguas como el hindi y el telugu.
- Base para fine-tuning ligero: con 125 M de parametros y licencia Apache 2.0, es viable afinarlo en una sola GPU de consumo para tareas acotadas de clasificacion o continuacion de dominio.
- Comparativa de escalado: sirve como punto de referencia de un modelo de 125 M entrenado con 2,57 B de tokens para contrastar curvas de perdida y calidad frente a modelos mayores del mismo autor (Tenketsu-Base-550M, en desarrollo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final de 2,88 (perplejidad 17,7) sobre documentos reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 250 MB solo para pesos; en cuantizacion de 8 bits, unos 125 MB; en 4 bits, unos 65 MB. El repo ocupa 0,8 GB en total.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo se entreno en una RTX 4050 de portatil de 6 GB y en T4.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM`), llama.cpp, Ollama (imagen `dattebayostorm/tenketsu-base-125m`) y text-generation-inference, segun los tags del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Tenketsu-Base-125M | 125,3 M | 1.024 | en, hi, te | Apache 2.0 | Entrenado from scratch, sin instruction tuning |
| GPT-2 small | 124 M | 1.024 | en | MIT (pesos publicados por OpenAI) | Referencia de calidad citada por el propio autor |
| Modelos base de 125 M tipo Pythia-160M | 160 M | 2.048 | en | Apache 2.0 | Alternativa de referencia para investigacion; datos no verificados en esta ficha |

La comparacion cuantitativa de rendimiento con estas alternativas no esta disponible: no se han publicado benchmarks del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no responde preguntas ni sigue instrucciones de forma fiable; su uso previsto es la continuacion de texto.
- Riesgo alto de alucinacion: el autor advierte explicitamente de que inventa hechos y de que no debe usarse para informacion factual ni para nada importante.
- Deriva y repeticion: con decodificacion greedy entra en bucles rapidamente; se recomienda muestreo con penalizacion de repeticion.
- Hindi y telugu son debiles por diseno del tokenizer (fragmentacion de aproximadamente 1,5 caracteres por token), lo que reduce la cantidad efectiva de texto indico visto.
- El codigo generado es basico y no debe tratarse como codigo de produccion sin revision.
- Sin tuning de seguridad: las salidas pueden ser erroneas, sesgadas o sin sentido.
- Contexto muy corto (1.024 tokens), insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la calidad del modelo hace desaconsejable su uso en produccion; los datasets de origen (FineWeb-Edu ODC-By 1.0, Wikipedia CC BY-SA 4.0, codeparrot bajo licencias originales) imponen obligaciones de atribucion que conviene revisar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/udithuzumaki/Tenketsu-Base-125M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Ollama (imagen del autor): `dattebayostorm/tenketsu-base-125m`
