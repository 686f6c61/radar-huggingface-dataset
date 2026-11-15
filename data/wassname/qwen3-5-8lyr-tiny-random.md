# wassname/qwen3.5-8lyr-tiny-random

## Resumen

`wassname/qwen3.5-8lyr-tiny-random` es un checkpoint de pesos aleatorios derivado de la arquitectura de Qwen/Qwen3.5-4B, publicado por el usuario wassname. No es un modelo entrenado ni un asistente funcional: su proposito es servir como artefacto de pruebas de software (tests unitarios, validacion de pipelines de carga, verificacion de plantillas de chat y de atencion) sin necesidad de descargar ni ejecutar el modelo completo de 4.000 millones de parametros.

El modelo conserva el tokenizador original de Qwen3.5-4B, el vocabulario completo, la plantilla de chat/thinking/tool y los tokens especiales, pero reduce drasticamente la anchura y profundidad de la red: anchura 64, MLP de 128, 8 capas y 16.227.664 parametros totales en safetensors bf16 con embeddings atados. Mantiene el patron de atencion hibrida de Qwen3.5 (tres capas de atencion lineal seguidas de una capa de atencion completa).

Su relevancia es acotada pero clara para desarrolladores de infraestructura: permite validar en CPU, sin FlashAttention ni kernels FLA, el flujo completo de `transformers` (carga, forward/backward, decodificacion con cache, lotes con padding, generacion y preservacion de plantillas) con un repo de 0,1 GB y salidas sin significado semantico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y atencion completa (patron Qwen3.5: 3 capas lineales + 1 capa full-attention) |
| Parametros totales | 16.227.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, embeddings atados) |

## Arquitectura y entrenamiento

El modelo replica la topologia de atencion de Qwen3.5-4B a escala reducida: anchura 64, MLP 128, 8 capas y dimension de cabeza 32, con secciones RoPE redimensionadas a [2, 1, 1] y fraccion rotatoria de 0,25. Conserva la alternancia de tres capas de atencion lineal seguidas de una capa de atencion completa, de modo que las capas de atencion completa son las de indice cero-based 3 y 7. Los embeddings estan atados.

No hubo entrenamiento: los pesos son aleatorios, generados con semilla 42 a partir de la configuracion de Qwen/Qwen3.5-4B (commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), sin copiar pesos preentrenados. El proceso de construccion se ejecuta con `uv run python -m lucid3.tiny_qwen --out <new-directory> --layers 8 --seed 42`, y requiere tener cacheados localmente el tokenizador, la config y la licencia de origen. El autor verifico forward/backward sobre el modelo guardado, decodificacion con cache, lotes con padding, generacion y preservacion de plantillas. Para tests que accedan a las capas 16 y 30 se debe reconstruir con `--layers 32`, ya que 8 capas no pueden suministrarlas.

## Capacidades

- Generacion de texto sintacticamente valida pero semanticamente sin sentido: los pesos son aleatorios, por lo que no existe capacidad real de razonamiento, codigo ni matematicas.
- Carga y ejecucion con la API estandar de `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`).
- Preservacion del tokenizador original de Qwen3.5-4B: vocabulario completo, tokens especiales y plantilla de chat/thinking/tool.
- Soporte de `apply_chat_template` con `enable_thinking=False` y generacion con `do_sample=False`.
- Extraccion de mapas de atencion con `attn_implementation="eager"` y `output_attentions=True`; solo las capas de atencion completa devuelven mapas (capas 3 y 7 en un modelo de 8 capas), mientras que las capas lineales usan estados recurrentes.
- Ejecucion en CPU sin necesidad de FlashAttention ni de la libreria FLA; los kernels optimizados de GPU son opcionales.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No soporta imagen, audio ni video: es exclusivamente texto.

## Casos de uso

- Tests unitarios de pipelines de carga: permite verificar en CI que una version concreta de `transformers` carga correctamente un checkpoint con atencion hibrida, sin descargar 4.000 millones de parametros ni requerir GPU.
- Validacion de plantillas de chat y tokens especiales: al conservar el tokenizador y la plantilla de Qwen3.5-4B, sirve para comprobar que el formateo de mensajes, el modo thinking y las herramientas se serializan igual que en el modelo real.
- Verificacion de extraccion de mapas de atencion: util para testear herramientas de interpretabilidad o visualizacion que esperan mapas de atencion en capas concretas (3 y 7), documentando que las capas lineales no los producen.
- Pruebas de decodificacion con cache y lotes con padding: el autor valido ambos escenarios, por lo que el checkpoint sirve como fixture para regresiones en rutinas de generacion por lotes.
- Desarrollo de harnesses de evaluacion: permite probar el codigo de orquestacion (prompting, parseo de salidas, limites de tokens) sin coste de inferencia real, sabiendo que las respuestas no son validas semanticamente.
- Pruebas de compatibilidad de kernels y backends: al funcionar en CPU con `attn_implementation="eager"` y admitir SDPA para generacion, sirve para comparar rutas de ejecucion antes de escalar al modelo completo.
- Validacion de empaquetado y despliegue: con 0,1 GB de repo, es adecuado para testear flujos de descarga, cache local y servido en endpoints en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor advierte que las salidas aleatorias carecen de significado y que una generacion exitosa no demuestra capacidad de chat ni de uso de herramientas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (16,2 millones de parametros); cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se requieren; cualquier GPU con soporte bf16 puede ejecutarlo, pero no aporta ventaja frente a CPU por el tamano.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 3060, RTX 4090, etc.), aunque el caso de uso natural es CPU.
- Opciones de despliegue: `transformers` con `attn_implementation="eager"` o SDPA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles. Al ser un modelo diminuto en CPU, la latencia sera muy baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wassname/qwen3.5-8lyr-tiny-random | 16,2 M | no disponible | Fixture de tests con pesos aleatorios | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | ~4.000 M (no confirmado en la informacion) | no disponible | Asistente de texto entrenado | no disponible en la informacion | Hugging Face |
| Otros checkpoints "tiny random" de la familia Qwen | no disponible | no disponible | Fixtures de tests | no disponible | no disponible |

La comparacion relevante es con el modelo base: este checkpoint no compite en capacidad, sino que sustituye al modelo completo en entornos de prueba. No se dispone de datos de benchmarks ni de otros checkpoints tiny-random comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios: las salidas no tienen significado y no deben usarse para ninguna tarea de usuario final.
- No es un asistente entrenado; no ha pasado por RLHF, DPO ni ajuste supervisado.
- No debe interpretarse una generacion correcta como evidencia de capacidad de chat o de tool calling.
- Con 8 capas no es posible acceder a las capas 16 y 30; para tests que las requieran hay que reconstruir con `--layers 32`.
- Los mapas de atencion solo estan disponibles en las capas de atencion completa (3 y 7); las capas lineales no los devuelven.
- SDPA permite generacion pero no devuelve mapas de atencion en la version de `transformers` probada por el autor.
- La longitud de contexto, los idiomas soportados y las opciones de cuantizacion no estan documentados.
- La licencia apache-2.0 permite uso comercial del artefacto, pero al no ser un modelo funcional ese uso carece de sentido practico; ademas, la procedencia de configuracion y tokenizador depende del modelo base Qwen/Qwen3.5-4B.
- Riesgo de confusion en produccion: no debe desplegarse por error en lugar del modelo base; conviene etiquetarlo y aislarlo en entornos de test.

## Enlaces

- Hugging Face: https://huggingface.co/wassname/qwen3.5-8lyr-tiny-random
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base usado en la construccion: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Repositorio del script de construccion (`lucid3.tiny_qwen`): no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
