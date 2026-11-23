# voodooquant/Hy4-flash-DFly2-INT8-PTQR

## Resumen

Hy4-flash-DFly2-INT8-PTQR es un modelo borrador (draft model) especializado en decodificacion especulativa, no un modelo generativo autonomo. Lo publica el usuario voodooquant como artefacto cuantizado del DFly2 original que acompana a Tencent Hy4-flash, y esta disenado para emparejarse exclusivamente con el modelo objetivo `voodooquant/Hy4-flash-INT4-NeUQI`. Su funcion es proponer tokens candidatos que el modelo objetivo verifica, acelerando la decodificacion sin alterar la distribucion final de salida.

Tecnicamente es una red de cinco capas con una red de correccion de estado oculto, cuyos pesos de proyeccion se almacenan en INT8 simetrico con una escala FP16 separada por cada 128 canales de entrada (formato w8a8, group size 128). La atencion es MLA (Multi-head Latent Attention) con query y KV en INT8 agrupado y productos probabilidad/valor en FP16. El checkpoint ocupa 0,9 GB y contiene 845.686.433 parametros.

Su relevancia es de nicho pero concreta: demuestra un flujo completo de cuantizacion INT8 consciente del redondeo (PTQR) sobre un borrador especulativo, con recetas de servicio para AMD ROCm (MI100) y metricas de aceptacion medidas en hardware real. No es un modelo para usar de forma independiente: requiere el embedding de tokens, la cabeza de vocabulario, el estado oculto, los indices dispersos y las cinco cachas MLA del objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con red de correccion de estado oculto; atencion MLA agrupada; borrador para decodificacion especulativa DFly2 |
| Parametros totales | 845.686.433 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma autonoma; comparte contexto KV del objetivo (capas 25, 29, 33, 37 y 41, indexadas desde cero) |
| Tipos de cuantizacion | INT8 simetrico w8a8, group size 128 en pesos de proyeccion; entradas INT8 dinamicas por token y por grupo; atencion MLA INT8 con productos FP16 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (license: other) |
| Formato de pesos | safetensors, libreria vllm |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo DFly2 de cinco capas mas una red de correccion de estado oculto. Cada capa consume las cachas KV compartidas del objetivo en las capas 25, 29, 33, 37 y 41, de modo que el borrador no mantiene su propio contexto completo sino que reutiliza el estado del modelo grande. La atencion es MLA con query y KV cuantizados en INT8 agrupado y productos de probabilidad y valor en FP16.

El entrenamiento usa PTQR (optimizacion de pesos y escalas a traves de la operacion de redondeo del formato desplegado), con un maestro congelado (el borrador original) y estados de prefijo del objetivo real. Se muestrean tokens de borrador previos para que la red de correccion vea el historial que encontrara en inferencia. El checkpoint publicado corresponde al paso 60 de una ejecucion PTQR de 60 pasos sobre 52 secuencias de entrenamiento y 12 de validacion. El decodificador de ancho fijo upstream omite la cabeza de confianza adaptativa, pero el checkpoint conserva sus dos tensores originales.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa junto al objetivo Hy4-flash-INT4-NeUQI.
- Reutilizacion del contexto KV del objetivo mediante cinco cachas MLA compartidas.
- Red de correccion de estado oculto que ajusta las propuestas a partir del historial de borradores previos.
- Soporte de tool calling y agentes: heredado del objetivo, no del borrador (el borrador solo acelera la decodificacion).
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible en el borrador; depende del objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion con vLLM: el borrador se sirve junto al objetivo mediante el metodo `dfly`, aumentando los tokens emitidos por ronda (mediana de 2,57 en la receta MI100) y reduciendo el coste por token generado.
- Despliegue en clústeres AMD ROCm: la receta de cuatro MI100 a 105 W alcanza 109,1 tok/s agregados en un flujo de ocho peticiones con prefijo de 16k, lo que lo hace adecuado para entornos con GPU AMD y restricciones de potencia.
- Servicio de tool calling y agentes multi-paso: al compartir el contexto del objetivo y soportar flujos de ocho streams, encaja en pipelines de agentes que requieren muchas llamadas cortas y verificacion por token.
- Revision de codigo automatizada: la validacion se hizo con ocho prompts de revision de codigo de aproximadamente 2k tokens generando 256 tokens cada uno, un escenario realista de CI/CD con code review asistido.
- Reduccion de latencia en atencion al cliente multi-turno: al reutilizar las cachas KV del objetivo, mantiene conversaciones largas sin duplicar el coste de memoria del contexto.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de cuantizacion INT8 con PTQR sobre un borrador, con metricas de KL, acuerdo greedy y aceptacion publicadas.
- Despliegue en PCIe sin puentes XGMI: la receta nativa PCIe alcanza 104,4 tok/s agregados con transferencias RCCL hospedadas en host, util en nodos sin interconexion directa.

## Benchmarks y rendimiento

| Metrica | Original | PTQR (este checkpoint) |
|---|---|---|
| KL medio respecto al borrador original (trayectorias muestreadas) | 0,004551 | 0,003845 |
| Acuerdo greedy con el borrador original | 81/84 | 79/84 |
| Coincidencias de argmax con el objetivo (84 posiciones teacher-forced) | 40 | 41 |
| KL medio objetivo-borrador a temperatura 1 | 2,3275 | 2,3271 |
| Variacion total media | 0,5735 | 0,5731 |

Rendimiento de servicio medido (cuatro MI100 a 105 W, 7 propuestas, latent scale group 128, rotary group 64, temperatura 1,0, top-p 0,95, top-k 20):

| Escenario | Tokens emitidos por ronda | Aceptacion | Tokens/s agregados | ms por ronda |
|---|---|---|---|---|
| Ocho streams con prefijo caliente de 16k (MI100, solape completo) | 2,57 | 22,4 % | 109,1 | 188,2 |
| Mismo flujo en PCIe nativo | 2,57 | no disponible | 104,4 | no disponible |

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 0,9 GB en INT8; hay que sumar la memoria del objetivo Hy4-flash-INT4-NeUQI y las cinco cachas MLA compartidas.
- GPU recomendadas: AMD MI100 (receta validada con cuatro tarjetas a 105 W); no se han publicado mediciones en NVIDIA.
- GPU de consumo: no disponible; no se ha validado en RTX 4090 ni similares.
- Opciones de despliegue: vLLM con el metodo de especulacion `dfly`, lanzador del objetivo y variable `DRAFT_MODEL_DIR` para sobrescribir la ruta local.
- Latencia y throughput: 188,2 ms por ronda y 109,1 tok/s agregados en la receta MI100 de cuatro tarjetas; 104,4 tok/s en PCIe nativo.
- Interconexion: las mediciones PCIe usaron transferencias RCCL hospedadas en host con puentes XGMI instalados; no se midieron transferencias peer-to-peer directas en sistemas sin puentes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-DFly2-INT8-PTQR | Borrador especulativo INT8 | 845.686.433 | Compartido con objetivo | Tencent Hy License 1.0 | Hugging Face, 56 descargas |
| DFly2 original (tencent/Hy4-flash) | Borrador especulativo sin cuantizar | no disponible | Compartido con objetivo | Tencent Hy License 1.0 | Hugging Face |
| Hy4-flash-INT4-NeUQI | Objetivo cuantizado INT4 | no disponible | no disponible | Tencent Hy License 1.0 | Hugging Face |
| Borradores EAGLE / Medusa genericos | Borradores especulativos | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos publicados de otros borradores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el objetivo Hy4-flash-INT4-NeUQI, su embedding, cabeza de vocabulario, estado oculto, indices dispersos y cinco cachas MLA. No puede usarse solo.
- La validacion es limitada: 52 secuencias de entrenamiento, 12 de validacion y 84 posiciones teacher-forced. La aceptacion real se mide por separado en peticiones generadas.
- El acuerdo greedy con el borrador original bajo de 81/84 a 79/84 tras PTQR, aunque la KL mejoro.
- La tasa de aceptacion medida es del 22,4 %, con 2,57 tokens emitidos por ronda; el beneficio depende del objetivo y de la carga.
- Solo hay mediciones en AMD MI100 y PCIe nativo; no hay datos de rendimiento en NVIDIA ni en GPU de consumo.
- Las pruebas PCIe usaron puentes XGMI y RCCL con transferencias hospedadas en host; no se midieron transferencias peer-to-peer directas sin puentes.
- Licencia Tencent Hy License 1.0: revisar el texto y el NOTICE antes de uso comercial; no es una licencia permisiva estandar.
- Riesgo de alucinacion: heredado del objetivo, no del borrador; el borrador no corrige errores del objetivo.
- Idiomas soportados: no disponibles en la informacion del repositorio.
- El decodificador de ancho fijo upstream omite la cabeza de confianza adaptativa, aunque el checkpoint conserva sus dos tensores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodooquant/Hy4-flash-DFly2-INT8-PTQR
- Objetivo emparejado: https://huggingface.co/voodooquant/Hy4-flash-INT4-NeUQI
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Seccion DFly2 del modelo base: https://huggingface.co/tencent/Hy4-flash#dfly2-for-speculative-decoding
- Receta de servicio MI100: https://github.com/curvedinf/int8-vllm/blob/main/docs/recipes/hy4-flash.md
- Metricas de entrenamiento y referencia: dfly-training.json (en el repositorio del modelo)
- Licencia: LICENSE (en el repositorio del modelo)
- Aviso: NOTICE (en el repositorio del modelo)
