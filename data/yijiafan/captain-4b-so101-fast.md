# YijiaFan/CaPtain-4B-SO101-Fast

## Resumen

CaPtain-4B-SO101-Fast es una compilación optimizada para inferencia del agente robótico CaPtain, especializado en el brazo SO-101 (SO-ARM101). Lo desarrolla YijiaFan como evolución del modelo base CaPtain-4B, que a su vez deriva de Qwen3.5-4B tras un proceso de SFT y RL sobre el benchmark LIBERO. Este modelo concreto parte del checkpoint `ck300-r1113c`, afinado sobre 555 rollouts exitosos del gemelo digital MuJoCo del SO-101, y se distribuye cuantizado a W4A16 con `lm_head` en W8A16, junto con una cabeza MTP (multi-token prediction) entrenada específicamente para decodificación especulativa.

La propuesta del modelo es poco habitual: no genera acciones directamente, sino que escribe código Python contra la API del CaPtain-Harness, lee los recibos de sus propias llamadas al robot y decide por sí mismo cuándo ha terminado la tarea. Es, por tanto, un agente "code-as-policy" para robótica encarnada, con percepción visual integrada (imagen-texto-a-texto) y un contexto de 64k tokens con compactación que conserva los últimos 16k.

Su relevancia actual reside en la combinación de tres piezas: cuantización agresiva (4 bits en los decodificadores), decodificación especulativa con vocabulario de borrador reducido a 16.384 tokens y parches de atención split-KV para los pasos de verificación. Según el autor, el agente completo (política más percepción) se ejecuta en dos RTX 4090 a aproximadamente 1,46 s por petición al modelo, medido sobre el gemelo digital, y se ha desplegado en un brazo SO-101 real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForConditionalGeneration` con cabeza MTP de 1 capa; atención GDN (gated delta net) y capas `Linear` cuantizadas |
| Parametros totales | 5.174.964.736 (según safetensors); el nombre comercial indica "4B" |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 64k tokens con compactación que conserva los últimos 16k; máximo 12 imágenes por petición |
| Tipos de cuantizacion | W4A16 (int4, grupo 128, simétrico, RTN) en `Linear` del decodificador; W8A16 (int8, grupo 128) en `lm_head`; visión, embeddings, norms y `in_proj_a/b` de GDN en bf16; opción FP8 en prefill |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`), más `mtp.safetensors` y vocabulario de borrador en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B: un transformer con capas de atención GDN (gated delta net) y una cabeza MTP de una sola capa que vLLM aprovecha para decodificación especulativa. La política se cuantiza con `llm-compressor` mediante round-to-nearest sin datos de calibración: W4A16 en todas las capas `Linear` excepto el torreón de visión y las proyecciones `in_proj_a`/`in_proj_b` de GDN, y W8A16 en `lm_head`. El fichero de pesos de política ocupa 4.432.275.784 bytes.

La cadena de entrenamiento es la siguiente. Primero, CaPtain-4B se obtiene a partir de Qwen3.5-4B con SFT y RL sobre LIBERO (ronda 300, "ck300"). Después, ese checkpoint se afina sobre 555 rollouts exitosos del gemelo digital nativo del SO-101 en MuJoCo, que suman 16.557 filas de datos recogidos con agentes profesor GPT-6.x en CaPtain-Harness. El SFT se ejecutó en 8x H100, 2 épocas, 1.228 pasos, LR pico 1e-5 con schedule coseno y torreón de visión congelado. La percepción es exclusivamente real (SAM 3, Molmo2-8B y profundidad monocular MoGe-2), sin estado privilegiado.

La cabeza MTP "run13" se inicializó desde un borrador anterior (run3) y se entrenó sobre las propias salidas registradas de `ck300-r1113c` en el gemelo: 24 episodios, 68 cuerpos de petición, 3 épocas, T=1.0 y 5 pasos de borrador desenrollados. El vocabulario de borrador (`draft_vocab16384_r13.safetensors`) contiene los tokens especiales, todos los tokens que la política emitió en esas salidas y los ids BPE más bajos hasta 16.384 filas; 362 de 78k tokens de salida retenidos quedan fuera. El proceso es sin pérdida porque el modelo objetivo verifica cada token del borrador.

## Capacidades

- Generación de código Python como política de control: escribe programas contra la API del CaPtain-Harness en lugar de emitir acciones motoras directas.
- Percepción visual integrada: pipeline imagen-texto-a-texto con hasta 12 imágenes por petición y contexto de 64k con compactación.
- Lectura de recibos de ejecución: interpreta las respuestas de sus propias llamadas al robot y decide cuándo la tarea ha concluido.
- Razonamiento multi-paso y comportamiento de agente encarnado: hasta 100 peticiones al modelo por episodio.
- Decodificación especulativa con MTP: cabeza de borrador entrenada sobre las salidas de la propia política y vocabulario reducido a 16.384 tokens.
- Soporte de tool calling implícito a través de la API del harness (llamadas al robot como herramientas).
- Multilingüe: no disponible (solo inglés declarado).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica con SO-101 en laboratorio: el modelo escribe código de control contra la API del harness, lee los recibos de cada llamada y encadena subtareas hasta completar el objetivo. Adecuado porque la política se ha afinado específicamente sobre rollouts del gemelo digital de ese brazo.
- Despliegue en hardware de consumo: con la cuantización W4A16 y los parches de vLLM, el agente completo cabe en dos RTX 4090 a ~1,46 s por petición, lo que permite montar un banco de pruebas de robótica sin clúster de datacenter.
- Investigación en code-as-policy: sirve como referencia reproducible para estudiar la brecha entre políticas que emiten acciones y políticas que emiten programas, con datos SFT públicos (`CaPtain-SO101-SFT-Data`).
- Evaluación de decodificación especulativa en robótica: la cabeza MTP y el vocabulario de borrador permiten medir el impacto de la verificación sin pérdida en latencia de agente con contexto largo.
- Prototipado de tareas pick-and-place y ensamblaje simple: el modelo puede generar secuencias de llamadas al harness para tareas de manipulación acotadas, siempre que se validen en el gemelo antes de pasar al robot físico.
- Formación y docencia: al ser Apache 2.0 y ejecutable en GPUs de consumo, resulta útil para cursos de robótica con agentes LLM, con la salvedad de que requiere el harness para funcionar.
- Integración en pipelines de evaluación continua: los parches de vLLM y los scripts de cuantización y entrenamiento del borrador permiten reproducir la build y comparar variantes de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una métrica de servicio: aproximadamente 1,46 s por petición al modelo con el agente completo (política más percepción) sobre dos RTX 4090, medida en el gemelo digital y validada con despliegue en un SO-101 real.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 4,8 GB (pesos de política 4,43 GB, cabeza MTP 241 MB, vocabulario de borrador 84 MB). Con overhead de KV cache para 64k de contexto y 12 imágenes, se recomienda planificar al menos 24 GB por GPU en el esquema de dos GPUs descrito por el autor.
- GPUs recomendadas: 2x RTX 4090 según la configuración de referencia del autor con vLLM 0.29. Para despliegues mayores, A100 o H100 no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, en el esquema de dos RTX 4090 descrito; no se documenta un despliegue en una sola GPU de consumo.
- Opciones de despliegue: vLLM 0.29 con los parches de `robots/soarm/tools/vllm_patches` cargados como `sitecustomize`; requiere el CaPtain-Harness para operar el robot. Otros motores (llama.cpp, Ollama, TGI) no están documentados.
- Latencia y throughput: ~1,46 s por petición al modelo en la configuración de referencia. El parche `SOARM_VLLM_PATCH_FP8_PREFILL=1` acelera el prefill con GEMMs FP8 manteniendo el decode en W4 Marlin, a costa de perder la fidelidad numérica en prefill y requerir `VLLM_DISABLE_COMPILE_CACHE=1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CaPtain-4B-SO101-Fast | 5,17B (según safetensors) | 64k con compactación a 16k | Code-as-policy para SO-101, cuantizado W4A16 + MTP | Apache 2.0 | Hugging Face |
| CaPtain-4B | no disponible | no disponible | Agente code-as-policy base (ronda 300 de RL) | Apache 2.0 (según modelo derivado) | Hugging Face |
| Qwen3.5-4B | ~4B (nominal) | no disponible | LLM multimodal generalista | no disponible | Hugging Face |

La comparación con políticas robóticas específicas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia dura del CaPtain-Harness: el modelo no es utilizable de forma autónoma; sin el harness y la API del robot no puede ejecutar acciones.
- Especialización estrecha: está afinado para el brazo SO-101 y su gemelo MuJoCo; el rendimiento en otros robots o entornos no está documentado.
- Solo inglés declarado; no se documenta soporte multilingüe.
- La cuantización W4A16 se aplicó con round-to-nearest sin calibración, lo que puede degradar la fidelidad frente al checkpoint bf16 `ck300-r1113c`, que no se ha publicado.
- El parche FP8 en prefill no es sin pérdida (solo en prefill); el resto de parches sí preservan las salidas del objetivo.
- Riesgo de alucinación en la generación de código de control: el modelo puede producir llamadas a la API inexistentes o secuencias inválidas; la verificación mediante recibos del harness es parte del diseño, pero no elimina el riesgo en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar la seguridad física del despliegue recae en el integrador.
- El vocabulario de borrador cubre 16.384 tokens; 362 de 78k tokens de salida retenidos quedan fuera, lo que no rompe la corrección (verificación del objetivo) pero puede reducir la tasa de aceptación en dominios léxicos alejados del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YijiaFan/CaPtain-4B-SO101-Fast
- Modelo base: https://huggingface.co/YijiaFan/CaPtain-4B
- Paper: https://arxiv.org/pdf/2610.40799
- Página del proyecto: https://waltstephen.github.io/captain/
- Código SO-101 (gemelo, herramientas, parches de serving, cuantización, entrenamiento del borrador): https://github.com/waltstephen/CaPtain/tree/so101-fast
- Harness (requerido para ejecutar el modelo): https://github.com/waltstephen/CaPtain-Harness/tree/so101-fast
- Dataset SFT SO-101: https://huggingface.co/datasets/YijiaFan/CaPtain-SO101-SFT-Data
