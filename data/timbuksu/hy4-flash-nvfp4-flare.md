# timbuksu/Hy4-flash-NVFP4-FLARE

## Resumen
Hy4-flash-NVFP4-FLARE es un paquete de despliegue nativo para el runtime Flare del modelo multimodal `tencent/Hy4-flash`, exportado por el usuario timbuksu a partir de su checkpoint cuantizado `timbuksu/Hy4-flash-NVFP4`. No se trata de un modelo nuevo, sino de una distribucion empaquetada con kernels precompilados, pesos comprimidos en NVFP4/MXFP8, tablas Engram de n-gramas en 4 bits y grafos CUDA capturados, todo servido directamente desde Rust sin runtime de Python ni compilacion en tiempo de ejecucion. El objetivo es permitir el servicio del modelo en una unica GPU NVIDIA Blackwell SM120 (`gb202`) de 96 GiB con al menos 64 GiB de RAM de host.

El modelo subyacente es una arquitectura hibrida de 42 capas que combina atencion MLA con indice disperso, atencion de ventana deslizante de 512 tokens, cuatro flujos iHC, cuatro capas Engram y 41 capas LatentMoE con 512 expertos, ademas de un cabezal especulativo DFly2 de 5 capas y un codificador de vision SigLIP2 de 27 capas. Soporta contexto nativo de 1.048.576 tokens y un maximo de 8 peticiones concurrentes con 4 ranuras de vision simultaneas.

Su relevancia radica en que demuestra un flujo de despliegue de muy bajo nivel para un modelo MoE multimodal de gran tamano, con cuantizacion calibrada GPTQ NVFP4 en los expertos enrutados, MXFP8 selectivo en proyecciones sensibles y BF16 en capas densas de atencion, vision y borrador especulativo, manteniendo una fidelidad cercana al checkpoint BF16 original. La licencia es la Tencent Hy License, no estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de 42 capas: 12 MLA con indice disperso + 30 MLA con SWA-512, 4 flujos iHC, 4 capas Engram, 41 capas LatentMoE con 512 expertos; cabezal DFly2 de 5 capas; vision SigLIP2 de 27 capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos por capa LatentMoE) |
| Longitud de contexto | 1.048.576 tokens (1M nativo); trozo de prefill de 4.096 tokens |
| Tipos de cuantizacion | GPTQ NVFP4 calibrado en expertos enrutados (W4A16 en decode, W4A4 en prefill, escalas comprimidas con CSF); MXFP8 selectivo en `q_b_proj`, `linear_gate`, `o_proj`; BF16 en capas densas sensibles, atencion, vision y DFly2; tablas Engram en 4 bits `NVFP4_E4M3_GLOBAL` |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (`tencent-hy-license`, licencia "other") |
| Formato de pesos | Paquete nativo Flare (kernels precompilados, pesos NVFP4/MXFP8 comprimidos con CSF, tablas Engram 4-bit, grafos CUDA capturados); no cargable por Transformers, vLLM, SGLang ni llama.cpp |

## Arquitectura y entrenamiento
La arquitectura del modelo base es un transformer hibrido con atencion MLA en dos variantes: 12 capas con indice disperso y 30 capas con atencion de ventana deslizante de 512 tokens. Incorpora cuatro flujos iHC, cuatro capas Engram que actuan como tablas de n-gramas de 4 bits residentes en RAM de host (33,19 GiB en `NVFP4_E4M3_GLOBAL`, frente a 60,84 GiB en FP8) y 41 capas LatentMoE con 512 expertos cada una. Se anade un cabezal especulativo DFly2 de 5 capas y un codificador de vision SigLIP2 de 27 capas para entrada de imagen.

El paquete Flare aplica cuantizacion GPTQ calibrada a NVFP4 en los expertos enrutados, con W4A16 en decodificacion y W4A4 en prefill, escalas comprimidas mediante CSF, y mantiene MXFP8 selectivo en proyecciones sensibles (`q_b_proj`, `linear_gate`, `o_proj`). Las capas densas de atencion, vision y el borrador DFly2 permanecen en BF16 para preservar precision. La decodificacion especulativa usa DFly2 con anchos adaptativos de 1 a 6 y capacidad de 48 tokens especulativos, con cabezal borrador cuantizado en NVFP4 y verificacion exacta contra el objetivo BF16. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades
- Generacion de texto multimodal: el pipeline declarado es `image-text-to-text`, con codificador SigLIP2 de 27 capas y hasta 4 ranuras de vision concurrentes a 2048x2048.
- Razonamiento y generacion de prosa: medido en tareas de ensayo con decodificacion greedy y con los valores por defecto oficiales (`temperature=0.9`, `top_p=1.0`, `top_k=-1`).
- Generacion de codigo: se han medido cargas de codigo Rust (arbol B) y C (epoll de Linux) con velocidades de decodificacion de 98,05 y 99,87 tok/s respectivamente.
- Decodificacion especulativa: DFly2 con anchos adaptativos 1 a 6, aceptacion medida de 2,17 tokens por ronda en 1.824 rondas de peticion.
- Contexto largo: ventana nativa de 1.048.576 tokens con presupuesto de cache KV de 5,98 GiB, equivalente a 2.947 paginas KV MLA/C4 (754.432 tokens KV) y 298 ranuras de instantanea de prefijo compartido.
- Concurrencia: hasta 8 peticiones simultaneas, con rendimiento agregado medido de 355,88 tok/s a B=8 (61,45 tok/s por usuario).
- Tool calling y agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio: no disponible en la informacion proporcionada.

## Casos de uso
- Servicio de asistencia multimodal en produccion sobre una unica GPU Blackwell de 96 GiB: el paquete Flare permite levantar el modelo con `flare run` sin Python ni compilacion, con 88,38 GiB de memoria GPU cargada y 5,98 GiB reservados para cache KV, adecuado para equipos que quieran evitar la pila habitual de vLLM o TGI.
- Analisis de documentos e imagenes de alta resolucion: con 4 ranuras de vision SigLIP2 a 2048x2048 y contexto de 1M tokens, se pueden procesar lotes de capturas, diagramas o paginas escaneadas junto con texto largo en una sola peticion.
- Procesamiento de codigo en pipelines de CI/CD: la decodificacion medida de 98-100 tok/s en Rust y C permite generar parches, revisiones o explicaciones de codigo en flujos automatizados, siempre que la licencia Tencent Hy lo permita.
- Analisis de repositorios o corpus extensos: el contexto nativo de 1M tokens y las 298 ranuras de prefijo compartido permiten reutilizar prefijos largos entre peticiones, util para auditoria de codigo o resumen de documentacion tecnica.
- Despliegue en entornos con RAM de host limitada pero con NVMe: si no se dispone de 64 GiB de RAM, las tablas Engram pueden servirse desde disco en lugar de RAM, a costa de latencia adicional no cuantificada en la informacion disponible.
- Experimentacion con decodificacion especulativa: DFly2 con anchos adaptativos y verificacion BF16 exacta sirve como banco de pruebas para estudiar aceptacion especulativa y latencia en modelos MoE multimodales.
- Servicio interactivo de baja latencia: TTFT medido de 74,5-83,6 ms en decodificacion B=1 y 853 ms para un prompt de 5.483 tokens, adecuado para aplicaciones conversacionales con requisitos de primera respuesta por debajo del segundo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos aportados son de calidad frente al checkpoint BF16 y de rendimiento de servicio.

| Metrica | Valor |
|---|---|
| KL divergencia (42 capas, NVFP4 selectivo vs BF16) | 0,09434 |
| Top-1 coincidencia (NVFP4 vs BF16) | 91,02 % |
| Perplejidad NVFP4 | 10,789 |
| Perplejidad BF16 | 10,909 (ratio 0,9890x) |
| KL Engram 4-bit vs Engram FP8 | 0,0560 |

| Carga | Rendimiento |
|---|---|
| Prefill 5.483 tokens | TTFT 853,0 ms; 6.428,0 tok/s |
| Prefill 21.869 tokens | TTFT 3.432,8 ms; 6.370,5 tok/s |
| Prefill 43.804 tokens | TTFT 6.356,6 ms; 6.891,1 tok/s |
| Decode B=1 ensayo (greedy) | 94,52 tok/s; TTFT 83,6 ms |
| Decode B=1 ensayo (defaults) | 97,48 tok/s |
| Decode B=1 codigo Rust | 98,05 tok/s; TTFT 75,8 ms |
| Decode B=1 codigo C (epoll) | 99,87 tok/s; TTFT 74,5 ms |
| B=8 concurrente (8x256 tok) | 355,88 tok/s agregados; 61,45 tok/s por usuario |
| Multimodal PNG 128x128 | 123,21 tok/s; TTFT 77,8 ms; identificacion exacta de 4 cuadrantes |

## Requisitos de hardware
- GPU: una unica NVIDIA Blackwell SM120 (`gb202`) de 96 GiB, con TP=1. El paquete esta ajustado con `--lock-gpu-clocks` sobre RTX PRO 6000 Blackwell.
- RAM de host: 64 GiB o mas recomendados para mantener las tablas Engram de 33,19 GiB residentes en RAM; con menos RAM las tablas se sirven desde NVMe.
- Memoria GPU cargada: 88,38 GiB (85,9 GiB de pesos con CSF y cabezal borrador NVFP4, 54 grafos CUDA capturados), dejando 5,98 GiB para cache KV.
- No cabe en GPU de consumo: el paquete requiere 96 GiB de VRAM y no se puede cargar en RTX 4090 (24 GiB) ni en configuraciones por debajo de esa cifra.
- Opciones de despliegue: exclusivamente el runtime Flare (`flare run`). Transformers, vLLM, SGLang y llama.cpp no pueden cargar este paquete; para esos entornos debe usarse el checkpoint ModelOpt en safetensors `timbuksu/Hy4-flash-NVFP4`.
- Throughput y latencia medidos: prefill de 6.370-6.891 tok/s, decode de 94-100 tok/s a B=1, 355,88 tok/s agregados a B=8, TTFT de 74,5-83,6 ms en decode y espera media de 12,3 microsegundos por paso para la disponibilidad de la GPU con tablas Engram en RAM (1.207 pasos, cero lecturas a disco).

## Comparativa con modelos similares
No se dispone de datos de modelos comparables en la informacion proporcionada. El paquete es una distribucion de despliegue especifica del modelo `tencent/Hy4-flash`, por lo que la comparacion natural es contra su propio checkpoint BF16 y contra el checkpoint ModelOpt `timbuksu/Hy4-flash-NVFP4`; no se han aportado cifras de terceros.

| Criterio | Hy4-flash-NVFP4-FLARE | Hy4-flash-NVFP4 (ModelOpt) | Hy4-flash BF16 (upstream) |
|---|---|---|---|
| Formato | Paquete nativo Flare | Safetensors ModelOpt | Safetensors BF16 |
| Runtime compatible | Solo Flare | Transformers, vLLM, SGLang, llama.cpp | Transformers, vLLM, SGLang |
| Precision | NVFP4/MXFP8/BF16 selectivo | Cuantizado NVFP4 | BF16 |
| Contexto | 1.048.576 tokens | no disponible | no disponible |
| Licencia | Tencent Hy License | Tencent Hy License | Tencent Hy License |
| Hardware objetivo | 1x SM120 96 GiB | no disponible | no disponible |

## Limitaciones y advertencias
- El paquete no es cargable por las pilas estandar (Transformers, vLLM, SGLang, llama.cpp); queda atado al runtime Flare y a hardware Blackwell SM120 de 96 GiB, lo que reduce la portabilidad.
- La licencia Tencent Hy License no es una licencia open source estandar; es responsabilidad del usuario revisar sus terminos antes de cualquier uso comercial.
- La cuantizacion NVFP4 introduce una perdida medible de calidad: KL de 0,09434 y top-1 del 91,02 % frente a BF16, con perplejidad ligeramente inferior (10,789 frente a 10,909); no es una replica exacta del modelo original.
- Las tablas Engram en RAM consumen 33,19 GiB de host; en equipos con menos de 64 GiB se sirven desde NVMe, con impacto en latencia no cuantificado en la informacion disponible.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni comportamiento en dominios especializados.
- El limite de concurrencia es de 8 peticiones y 4 ranuras de vision; cargas superiores requieren escalado horizontal con varias GPU.
- El paquete esta ajustado con bloqueo de relojes de GPU (`--lock-gpu-clocks`); el rendimiento medido puede no reproducirse en configuraciones sin ese ajuste.
- La firma Ed25519 y la aprobacion explicita de la clave del publicador son requisitos del flujo de arranque; en entornos automatizados hay que pasar `--dangerously-accept-publisher` y `--dangerously-approve-key` con la huella SHA-256 indicada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/timbuksu/Hy4-flash-NVFP4-FLARE
- Checkpoint base cuantizado: https://huggingface.co/timbuksu/Hy4-flash-NVFP4
- Variante de 1M+ tokens KV: https://huggingface.co/timbuksu/Hy4-flash-NVFP4-1M-FLARE
- Modelo original: https://huggingface.co/tencent/Hy4-flash
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
