# w732857315/nncoss-Qwen3-0.6B

## Resumen

nncoss-Qwen3-0.6B es un conjunto de artefactos derivados de Qwen/Qwen3-0.6B publicados por el usuario w732857315 dentro del proyecto nncoss, un motor de inferencia propio escrito en Rust. El repositorio no contiene un modelo nuevo entrenado desde cero, sino una versión cuantizada a 4 bits (calibrada con GPTQ y posteriormente destilada en escalas de fila, normas y sesgos) junto con cinco variantes experimentales de edición directa de pesos y un modelo de autoaprendizaje por rechazo de muestras con LoRA fusionado.

El interés técnico está en el formato propietario `.nncossllm`, que solo carga el motor nncoss (nativo y WASM) y no es compatible con transformers, llama.cpp ni vLLM. El autor publica además un checkpoint estándar en safetensors f32 del modelo de autoaprendizaje (`school-r1/model.safetensors`), cargable con transformers, lo que permite reproducir parte del trabajo fuera del ecosistema nncoss.

La relevancia es limitada y de carácter experimental: el propio autor advierte que las cuatro ediciones de pesos puntuaron por debajo del modelo sin editar y se publican como registro de experimentos, no como modelos recomendados para uso. El modelo base Qwen3-0.6B es un transformer denso de 0,6 mil millones de parámetros con licencia Apache 2.0, orientado a generación de texto y razonamiento ligero en chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B); pesos en formato `.nncossllm` propietario |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits calibrada con GPTQ y destilacion de escalas de fila, normas y sesgos (~4,25 bits por peso); checkpoint f32 en safetensors para `school-r1` |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.nncossllm` (propietario, solo motor nncoss) y `safetensors` f32 (solo `school-r1/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. Sobre él, el autor aplica un pipeline de cuantizacion a 4 bits: calibracion GPTQ seguida de una destilacion de las escalas de fila, las normas y los sesgos, resultando en aproximadamente 4,25 bits por peso. El fichero resultante ocupa 318.862.912 bytes (unos 304 MiB) y solo es cargable por el motor nncoss, que usa el `tokenizer.json` del mismo directorio.

Sobre esa base cuantizada se documentan cuatro ediciones directas de pesos: una "puerta de recuperacion" que reescribe las escalas de fila de 16 neuronas MLP; una variante que combina esa puerta con la modificacion de las escalas de 8 cabezas KV (reduccion a la mitad o multiplicacion por 1,5); una variante solo con la modificacion de cabezas KV; y el zerado de la neurona 2997 de la MLP de la capa 1. Adicionalmente, `school-r1` es el resultado de una ronda de autoaprendizaje por rechazo de muestras con LoRA, posteriormente fusionada, de la que se publica tanto la version 4 bits como los pesos f32 fusionados. El pipeline de entrenamiento en Python fue eliminado del repositorio; los scripts y datos son consultables en el commit `aa625fd`.

## Capacidades

- Generacion de texto y respuesta a preguntas en chino e ingles, heredadas del modelo base Qwen3-0.6B.
- Razonamiento de tipo "no pensamiento" (non-thinking) en las evaluaciones realizadas por el autor, con decodificacion codiciosa y sin herramientas.
- Uso de herramientas en el modelo `school-r1`: la evaluacion del autor combina el modo "no pensamiento" con herramientas disponibles.
- Cuantizacion a 4 bits con perdida de precision medida: coherencia top-1 del 85,9 % frente a f32 en 908 posiciones de 7 textos internos.
- No se documentan capacidades de vision, audio, tool calling estructurado ni modos de pensamiento extendido en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de edicion de pesos: el repositorio sirve como banco de pruebas reproducible para medir el impacto de reescribir escalas de fila o zerar neuronas concretas en un modelo pequeno, comparando contra la linea base cuantizada.
- Investigacion sobre cuantizacion GPTQ con destilacion de escalas: el par f32/4 bits de `school-r1` permite analizar la degradacion de perplejidad (9,489 a 9,676) y la divergencia KL (0,111) en un modelo de 0,6 B.
- Pruebas de motores de inferencia propietarios: el formato `.nncossllm` y el motor nncoss (Rust, nativo y WASM) permiten validar pipelines de carga, tokenizacion y decodificacion fuera del ecosistema habitual.
- Experimentos de autoaprendizaje por rechazo de muestras: `school-r1` documenta una mejora del 55,0 % al 76,5 % en un banco propio de preguntas escolares con herramientas, util como referencia metodologica.
- Despliegue en entornos con recursos muy limitados: el fichero de 304 MiB en 4 bits es adecuado para pruebas en CPU o en GPUs de gama baja dentro del motor nncoss.
- Analisis de sesgos de cuantizacion en tareas de conocimiento: la caida de 11 a 13 puntos porcentuales en preguntas de conocimiento de `school-r1` frente a la mejora en tareas con herramientas es un caso de estudio sobre el equilibrio entre habilidades.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Coherencia top-1 Q4 vs f32 (908 posiciones, 7 textos) | 0,859 |
| KL media (f32 ‖ Q4) | 0,111 |
| Perplejidad f32 → Q4 | 9,489 → 9,676 |
| GAOKAO-Bench, 9 materias, 108 preguntas, `qwen3-0.6b-q4` | 41,7 % |
| GAOKAO-Bench, variante puerta de recuperacion | 35,2 % |
| GAOKAO-Bench, variante puerta + repeticion | 36,1 % |
| GAOKAO-Bench, variante solo repeticion | 30,6 % |
| Neurona 2997 zerada, 30 preguntas de conocimiento propias | Perdida de respuesta correcta ~7 % |
| `school-r1`, banco escolar propio, no pensamiento + herramientas | 55,0 % → 76,5 % |
| `school-r1`, preguntas de conocimiento | Descenso de 11 a 13 puntos porcentuales |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: en torno a 0,4-0,6 GB para pesos, mas overhead de activaciones y cache KV segun contexto; el fichero pesa 304 MiB.
- VRAM estimada para el checkpoint f32 de `school-r1`: aproximadamente 3 GB solo en pesos (3.006.565.056 bytes), mas activaciones.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM para la version 4 bits; el checkpoint f32 requiere al menos 4-6 GB.
- Cabe en GPU consumer: si, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y similares para la version cuantizada.
- Opciones de despliegue: el formato `.nncossllm` solo carga en el motor nncoss (nativo o WASM); el checkpoint `school-r1/model.safetensors` es cargable con transformers y, por tanto, con frameworks que acepten safetensors f32 (no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles en la informacion proporcionada; el repositorio incluye un ejemplo `bench` del motor nncoss para medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nncoss-Qwen3-0.6B | 0,6 B | No disponible | Apache 2.0 | `.nncossllm`, safetensors f32 | Cuantizacion 4 bits y ediciones experimentales; solo motor nncoss |
| Qwen/Qwen3-0.6B | 0,6 B | No disponible en esta ficha | Apache 2.0 | safetensors | Modelo base original, sin cuantizar; compatible con transformers |
| Qwen3-0.6B en GGUF (comunidad) | 0,6 B | No disponible | Apache 2.0 | GGUF | Despliegue en llama.cpp y Ollama; no verificado en esta informacion |
| Modelos de 0,5-1 B de otras familias (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1-2 B | No disponible | Licencias variables | safetensors, GGUF | Alternativas de tamano comparable; no evaluadas en esta informacion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Las cuatro ediciones de pesos puntuaron por debajo del modelo sin editar en GAOKAO-Bench (35,2 %, 36,1 % y 30,6 % frente a 41,7 %); el autor las publica como registro experimental, no para uso.
- El modelo `school-r1` mejora en tareas con herramientas pero pierde de 11 a 13 puntos en preguntas de conocimiento, lo que indica un desplazamiento de habilidades.
- El formato `.nncossllm` es propietario y no es compatible con el ecosistema estandar de inferencia; solo funciona con el motor nncoss.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- La cuantizacion a 4 bits introduce una divergencia medible: 85,9 % de coherencia top-1 y aumento de perplejidad de 9,489 a 9,676.
- El pipeline de entrenamiento en Python fue eliminado del repositorio; solo es recuperable desde el commit `aa625fd`.
- Solo se declaran chino e ingles; no hay soporte documentado de otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 0,6 B, agravado por la cuantizacion; no se han publicado evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero las ediciones experimentales no estan recomendadas para produccion por su perdida de rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/w732857315/nncoss-Qwen3-0.6B
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del motor nncoss: https://github.com/732857315/nncoss
- Documentacion de modelos del proyecto: `docs/models.md` en el repositorio nncoss
- Registro de experimentos: `docs/brain-experiments.md` en el repositorio nncoss
- Decisiones de diseno: `docs/decisions.md` en el repositorio nncoss
- Commit con scripts y datos de entrenamiento: `aa625fd` en el repositorio nncoss
