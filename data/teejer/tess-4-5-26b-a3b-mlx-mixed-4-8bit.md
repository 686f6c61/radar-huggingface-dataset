# teejer/Tess-4.5-26B-A3B-MLX-mixed-4-8bit

## Resumen

Tess-4.5-26B-A3B-MLX-mixed-4-8bit es una compilacion de precision mixta en formato MLX del modelo Tess-4.5-26B-A3B, un ajuste fino orientado a agentes y programacion desarrollado por Migel Tissera (Continuity Research) sobre Inkling 2 Mini de Thinking Machines Lab. La publica el usuario teejer como empaquetado de cuantizacion, no como modelo original. El modelo base es un transformer disperso (MoE) de 26,4B parametros totales con 3,4B activos, ventana de contexto de 1M tokens y torre de vision, lo que lo situa en la categoria de modelos agente con capacidad imagen-texto.

La relevancia de esta ficha concreta esta en la estrategia de cuantizacion: el checkpoint original ya venia empaquetado con expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), mientras que las proyecciones de atencion y la cabeza de desembebido estaban en BF16. Como el ajuste fino de codigo vive precisamente en esos tensores BF16, esta compilacion conserva los expertos en su formato nativo y gasta el presupuesto de 8 bits en las 145 matrices que el fine-tune modifica, logrando 5,62 bits por peso efectivos y unos 17,3 GB en disco.

El resultado es un paquete que carga en mlx-lm, LM Studio y mlx-serve, con decodificacion especulativa opcional mediante el borrador DSpark incluido, y que segun el autor alcanza unos 37 tok/s en decodificacion en frio y mas de 200 tok/s de prefill en un Apple M3 Ultra. Esta pensado para inferencia local en Apple Silicon, no para servidores CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (inkling2_loop), vision encoder y decodificacion especulativa DSpark |
| Parametros totales | 26,4B (segun model card); 6.896.142.848 tensores reportados en safetensors del repo |
| Parametros activos | 3,4B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Mixta: NVFP4 g16 y MXFP8 g32 nativos en expertos, 8-bit affine grupo 64 en atencion y lm_head, BF16/FP32 en el resto |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout MLX, libreria mlx) |
| Tamano en disco | 19,2 GB de repo; ~17,3 GB de pesos |
| Bits por peso efectivos | 5,62 |
| Pico de memoria en servicio | 18,6 GB en Apple Silicon |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con 26,4B parametros totales y 3,4B activos por token, organizado en 24 capas con un esquema de bucle (loop) que revisita capas internas: la model card de mlx-serve menciona 48 visitas en el perfil de servicio. Incorpora una torre de vision para entrada imagen-texto, proyecciones de atencion con tensores adicionales (q/k/v/o/r/gate), mecanismos de sink y message gates, y un borrador DSpark empaquetado en `mtp.safetensors` para decodificacion especulativa. El checkpoint de origen ya distribuia los expertos enrutados en NVFP4 y MXFP8, lo que indica un entrenamiento o post-entrenamiento consciente de cuantizacion de baja precision en la parte dispersa.

Sobre el ajuste fino: Tess-4.5 es un fine-tune de Inkling 2 Mini orientado a uso agentico y generacion de codigo, receta que segun la model card se concentra en las proyecciones de atencion y la cabeza de desembebido. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Esta compilacion MLX no reentrena nada: convierte el checkpoint original aplicando `checkpoint.sanitize` de mlx-lm para el layout inkling2 (fusion de expertos `mlp.experts.gate_up_proj`, orden de `global_scale`), mantiene los expertos como passthrough byte a byte y aplica cuantizacion affine de 8 bits con grupo 64 a las 144 proyecciones de atencion y al `lm_head`.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento extendido con modo thinking y control de esfuerzo (`reasoning_effort` en `high` o `xhigh`).
- Generacion y edicion de codigo, incluido el uso en pipelines agenticos de programacion.
- Tool calling y function calling, con plantilla de chat que acepta definiciones reales de herramientas.
- Razonamiento multi-paso y uso como agente con bucles de herramientas.
- Vision: pipeline image-text-to-text, permite entrada de imagenes junto a texto.
- Decodificacion especulativa opcional mediante el borrador DSpark (aceptacion del 81% en primer token en prompts cortos segun el autor).
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Asistente de programacion en local: el modelo puede integrarse en un IDE o CLI sobre Apple Silicon para autocompletado, refactorizacion y explicacion de codigo, aprovechando que el fine-tune de Tess se concentra en los tensores que esta compilacion mantiene a 8 bits.
- Agente autonomo con tool calling: con 1M de contexto y soporte de definiciones de herramientas, es adecuado para tareas de varios pasos que encadenan busquedas, ejecucion de comandos y edicion de ficheros sin perder el hilo de la sesion.
- Analisis de documentacion tecnica con imagenes: al aceptar entrada imagen-texto, sirve para interpretar diagramas de arquitectura, capturas de errores o esquemas junto a texto explicativo.
- Prototipado de agentes en estaciones de trabajo Mac: mlx-serve autoactiva el borrador DSpark, lo que permite servir el modelo con decodificacion especulativa sin configuracion adicional para pruebas de concepto.
- Revision de codigo en CI local: puede ejecutarse en un runner macOS con 18,6 GB de memoria pico para generar informes de revision o parches sugeridos sobre diffs.
- Experimentacion en investigacion de cuantizacion: el paquete documenta una politica mixta 4/8 bits con paridad greedy entre mlx-vlm, mlx-lm y mlx-serve, util como referencia reproducible para estudiar el impacto de preservar precision nativa en expertos.
- Chat de soporte tecnico en ingles: con contexto largo puede mantener conversaciones con historial extenso de incidencias, aunque solo en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento medidos que aporta el autor son de inferencia: ~37 tok/s de decodificacion en frio, mas de 200 tok/s de prefill, 81% de aceptacion de primer token del borrador DSpark en prompts cortos y 18,6 GB de pico de memoria, todo en un Apple M3 Ultra.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~18,6 GB de pico en servicio; ~17,3 GB de pesos en disco.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no hay pesos para CUDA ni GGUF en este repo.
- Cabe en GPU de consumo Apple: si, en equipos con al menos 24 GB de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); en M3 Ultra el autor reporta 37 tok/s de decodificacion.
- GPU NVIDIA: no aplicable a este paquete; para A100/H100/RTX 4090 habria que usar el checkpoint original en otro formato.
- Despliegue: mlx-lm (`mlx_lm.generate`), servidor de mlx-lm, LM Studio y mlx-serve (plugin `inkling2`, perfil `inkling2_loop`); el resto de cargadores ignoran `mtp.safetensors`.
- Latencia y throughput: ~200+ tok/s de prefill y ~37 tok/s de decodificacion en frio en M3 Ultra; sin datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato/plataforma |
|---|---|---|---|---|---|---|
| Tess-4.5-26B-A3B MLX mixed 4/8-bit (esta ficha) | 26,4B | 3,4B | 1M | Si | Apache-2.0 | MLX, Apple Silicon |
| migtissera/Tess-4.5-26B-A3B (original) | 26,4B | 3,4B | 1M | Si | Apache-2.0 | safetensors, generico |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Exclusivo de MLX y Apple Silicon: no se puede desplegar en CUDA, ROCm ni con llama.cpp/Ollama a partir de este repo.
- El muestreo es critico: el autor advierte que greedy o parametros sin ajustar pueden caer en bucles de repeticion en sesiones largas de razonamiento; recomienda temperatura 0,6, top-p 0,95, repeat penalty 1,2 y top-k 100.
- Riesgo de alucinacion inherente a modelos de 3,4B parametros activos, especialmente en tareas de codigo donde puede inventar APIs o firmas.
- La cuantizacion mixta preserva los expertos en 4 bits nativos: la precision efectiva en la parte dispersa es baja aunque sea la del checkpoint original.
- El numero de parametros reportado en safetensors (6,9B) no coincide con los 26,4B de la model card; conviene verificar el inventario real de tensores antes de planificar despliegues.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni evidencia independiente de la paridad declarada.
- Licencia Apache-2.0 heredada del modelo base; permite uso comercial, pero el autor de la compilacion no ofrece garantias.
- El borrador DSpark solo se aprovecha en mlx-serve; en otros cargadores se ignora y se pierde la aceleracion.

## Enlaces

- Hugging Face: https://huggingface.co/teejer/Tess-4.5-26B-A3B-MLX-mixed-4-8bit
- Modelo base Tess-4.5-26B-A3B: https://huggingface.co/migtissera/Tess-4.5-26B-A3B
- Modelo original Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio mlx-lm (PR de layout inkling2, #2086): https://github.com/ml-explore/mlx-lm
- Servidor mlx-serve: https://github.com/ddalcu/mlx-serve
