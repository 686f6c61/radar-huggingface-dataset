# urakozz/Inkling-2-Mini-DFlash2-W4A16-g64-AutoRound

## Resumen

Inkling-2-Mini-DFlash2-W4A16-g64-AutoRound es una cuantizacion a 4 bits de los pesos del modelo borrador (draft model) `incoai/Inkling-2-Mini-DFlash2`, publicado por el usuario urakozz. No es un modelo de lenguaje autonomo: es un drafter disenado para decodificacion especulativa, que trabaja junto al modelo objetivo `thinkingmachines/Inkling-2-Mini` dentro de un servidor de inferencia. Su funcion es proponer tokens candidatos que el modelo objetivo verifica, acelerando la generacion sin alterar la salida final.

El modelo cuenta con 158,9 millones de parametros y ocupa 0,42 GB en el repositorio, frente a los 0,99 GB del original en bf16. La cuantizacion se realizo con AutoRound 0.17.0 en esquema W4A16, grupo 64 y simetrico, y se calibro contra los propios estados ocultos del modelo objetivo, lo que lo hace especialmente ajustado al dominio de sesiones de programacion agentica.

Su relevancia es doble: por un lado, reduce a menos de la mitad los bytes movidos por pasada en el borrador, algo critico porque el paso de drafting esta limitado por ancho de banda de memoria; por otro, esta orientado especificamente al motor `intel-arc-inference-server` para tarjetas Intel Arc Pro B70 (Battlemage, Xe2). El soporte de este checkpoint en dicho motor esta en desarrollo y las tasas de aceptacion aun no se han medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion no causal por bloques (block size 8), convoluciones de atencion y MLP, y selector de candidatos con codebooks; modelo borrador para decodificacion especulativa |
| Parametros totales | 158.927.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el borrador opera sobre bloques de 8 tokens; calibrado con 2304 filas de contexto) |
| Tipos de cuantizacion | W4A16: pesos int4 empaquetados en GPTQ, grupo 64, simetrico, escalas fp16, qzeros 0x77777777, sin act-order; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (packed GPTQ), libreria transformers |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del drafter DFlash 2, que opera como borrador especulativo del modelo `thinkingmachines/Inkling-2-Mini`. El drafter ejecuta un forward no causal por bloques (tamano de bloque 8, 32 bloques por muestra) y consume los estados ocultos del modelo objetivo en cuatro puntos de acceso (visitas 5, 23, 41 y 48 del recorrido con bucle). Incluye proyecciones lineales `q/k/v/o` y `gate/up/down`, convoluciones de atencion y MLP con `base_kernel` y `kernel_projection`, y un `candidate_selector` con codebooks que realiza una preseleccion barata de candidatos en 2 bits antes del re-ranking exacto.

La cuantizacion se realizo con AutoRound 0.17.0 (esquema W4A16, grupo 64, simetrico, 200 iteraciones de ajuste, 128 muestras, batch 8, semilla 42). La calibracion se hizo con los estados ocultos del modelo objetivo en los cuatro puntos de acceso del drafter, sobre 63 peticiones de sesiones de programacion agentica grabadas (opencode), renderizadas con la plantilla de chat de Inkling y seguidas de 256 tokens de continuacion greedy del objetivo. Se mantuvieron a precision original todas las normas, los `base_kernel` y los codebooks del selector de candidatos; el resto de lineales se empaquetaron en int4. El export se verifico: todas las lineales listadas estan empaquetadas y los tensores preservados son identicos bit a bit al original.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa junto al modelo objetivo `thinkingmachines/Inkling-2-Mini`.
- Preseleccion de candidatos en 2 bits antes del re-ranking exacto mediante `candidate_selector`.
- Aceleracion de inferencia sin perdida de calidad: el modelo objetivo verifica cada token, por lo que la cuantizacion solo afecta al numero de tokens aceptados por paso, nunca a la salida.
- Operacion en el motor `intel-arc-inference-server` con kernels propios Level Zero / OpenCL e int4 small-batch GEMMs.
- No es un modelo autonomo: no genera texto por si mismo, requiere el embedding, la cabeza y los estados ocultos del modelo objetivo.
- Capacidades multilingues: no disponibles.
- Soporte de tool calling, agentes o vision: no disponible (no aplica como drafter).

## Casos de uso

- Aceleracion de decodificacion especulativa en produccion: se usa como `--draft-model` junto a `thinkingmachines/Inkling-2-Mini` en `b70-serve`, reduciendo los bytes movidos por pasada de drafting a menos de la mitad respecto al drafter int8.
- Despliegue en tarjetas Intel Arc Pro B70 (Battlemage, Xe2): el checkpoint esta disenado para el motor `intel-arc-inference-server`, que ejecuta kernels propios de int4 GEMM para las lineales del borrador.
- Servicio de generacion de codigo asistido: la calibracion se realizo sobre sesiones reales de programacion agentica (opencode), por lo que el borrador esta ajustado al dominio de texto y continuaciones tipicas de ese flujo.
- Investigacion en decodificacion especulativa: permite comparar tasas de aceptacion entre drafter bf16, int8 e int4 en el mismo objetivo, manteniendo la salida identica.
- Reduccion de huella de memoria en servidores con VRAM limitada: el repo ocupa 0,42 GB frente a 0,99 GB del original, liberando espacio para el modelo objetivo y el contexto KV.
- Evaluacion de cuantizacion AutoRound en modelos pequenos de tipo borrador: el `dflash_recipe.json` documenta la receta completa (iteraciones, muestras, semilla) para reproducir o adaptar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las tasas de aceptacion al servir con este drafter no se han medido aun, y que la carga en el soporte DFlash de SGLang o vLLM no esta probada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,42 GB en disco; en memoria, los pesos int4 empaquetados mas escalas y tensores preservados en precision original requieren aproximadamente 0,4-0,5 GB, ademas de los estados ocultos del modelo objetivo y el contexto KV que gestiona el servidor.
- GPU objetivo: Intel Arc Pro B70 (Battlemage, Xe2), a traves de `intel-arc-inference-server` con kernels Level Zero / OpenCL.
- Cabe en GPU de consumo: no disponible; el motor de referencia esta orientado a tarjetas Intel Arc Pro.
- Opciones de despliegue: `intel-arc-inference-server` (comando `b70-serve` con `--draft-model`); carga en SGLang o vLLM sin probar.
- Latencia y throughput: no disponibles; el paso de drafting esta limitado por ancho de banda de memoria, y el int4 mueve menos de la mitad de bytes por pasada que el int8.
- Nota: hasta que el motor soporte este checkpoint empaquetado, sirve el original bf16 cuantizado a int8 en carga.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| urakozz/Inkling-2-Mini-DFlash2-W4A16-g64-AutoRound | 158,9 M | int4 GPTQ (W4A16, g64) | 0,42 GB | Apache 2.0 | Soporte en motor en desarrollo; aceptacion no medida |
| incoai/Inkling-2-Mini-DFlash2 (original) | 158,9 M | bf16 | 0,99 GB | no disponible | Base de esta cuantizacion; sirve como drafter en el motor |
| Drafter int8 en carga (servido por el motor) | 158,9 M | int8 | no disponible | Apache 2.0 (del motor) | Alternativa actual mientras llega el soporte int4 |

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: requiere el embedding, la cabeza y los estados ocultos de `thinkingmachines/Inkling-2-Mini`; no puede usarse con `pipeline("text-generation")` de forma aislada.
- Las tasas de aceptacion al servir con este drafter no se han medido; el beneficio real de velocidad es desconocido.
- El soporte del checkpoint empaquetado en `intel-arc-inference-server` esta en desarrollo; la carga en SGLang o vLLM DFlash no esta probada.
- La cuantizacion no degrada la salida (el objetivo verifica cada token), pero puede reducir el numero de tokens aceptados por paso y, con ello, la aceleracion efectiva.
- La calibracion se limita a 63 peticiones de sesiones de programacion agentica; el rendimiento en otros dominios o idiomas no esta evaluado.
- Idiomas soportados no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `incoai/Inkling-2-Mini-DFlash2` y del objetivo.
- Riesgo de sesgos y alucinacion: no aplica directamente al no generar texto de forma autonoma, pero hereda las caracteristicas del modelo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/urakozz/Inkling-2-Mini-DFlash2-W4A16-g64-AutoRound
- Modelo base: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2 (revision 4f9088ea)
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini (revision b85c3cfa)
- Motor de inferencia: https://github.com/urakozz/intel-arc-inference-server
- AutoRound: https://github.com/intel/auto-round
