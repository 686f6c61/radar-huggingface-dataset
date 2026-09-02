# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2

## Resumen

SZL ReceiptAgent Qwen3.5 0.8B v2 es un adaptador LoRA (PEFT) de pequeño tamaño, desarrollado por SZLHOLDINGS, que se monta sobre el modelo base Qwen/Qwen3.5-0.8B. Su propósito es redactar recibos de gobernanza estructurados (drafts en JSON) y rechazar solicitudes que intenten fabricar evidencia, aprobación, ejecución o valores medidos. No es un agente autónomo ni un oráculo de hechos: está diseñado para operar detrás de un controlador validador externo que valida cada borrador contra un esquema JSON, exige aprobación humana y ejecuta acciones fuera de los pesos.

El modelo se entrenó con Unsloth sobre una GPU RTX 5050 Laptop, con solo 64 pasos de optimizador y 37 filas de entrenamiento, lo que lo convierte en un adaptador extremadamente ligero y rápido de reentrenar. La propuesta explícita es que el bucle de recepción de gobernanza pueda ejecutarse cada noche a bajo coste. Incluye un sistema de evidencia criptográfica (recibos firmados con Ed25519) que encadena el entrenamiento, la evaluación y la publicación, aunque no sustituye una evaluación independiente.

La relevancia actual radica en su enfoque de "proposal-only" (solo propuesta): el modelo nunca autoriza ni ejecuta, solo genera borradores que un sistema externo debe validar. Esto lo hace adecuado para entornos donde la trazabilidad y el control de integridad son críticos, como auditoría, cumplimiento o gobernanza interna, sin asumir riesgos de autonomía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (transformer decoder-only) |
| Parametros totales | 863.808.576 (base + adaptador); adaptador LoRA: 10.822.656 |
| Parametros activos | No aplica (no es MoE; todos los parametros del base son activos) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | 4-bit (usado en la inferencia de prueba); otros no especificados |
| Idiomas soportados | Ingles (dominante en evaluacion); otros no especificados |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-0.8B, un modelo transformer decoder-only de 0.8B parametros. El entrenamiento se realizo con la libreria Unsloth (FastLanguageModel) usando PEFT/LoRA. Se emplearon 64 pasos de optimizador con 37 filas de entrenamiento admitidas, alcanzando una perdida final de 0.9143. El pico de memoria reservada durante el entrenamiento fue de 1.671.430.144 bytes (~1,56 GB) en una NVIDIA GeForce RTX 5050 Laptop GPU.

El curriculo de entrenamiento es sintetico y estrecho, disenado especificamente para la tarea de generacion de recibos de gobernanza. Se excluyo deliberadamente el corpus A11oy Brain de los gradientes por cuestiones de derechos y procedencia. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion por preferencias. La innovacion principal no esta en la arquitectura, sino en el proceso de gobernanza: el adaptador viene acompanado de un sistema de recibos firmados criptograficamente que documentan el entrenamiento, la evaluacion y la publicacion, permitiendo verificar la integridad del ciclo de vida del modelo.

## Capacidades

- Generacion de borradores de recibos de gobernanza estructurados en JSON, cumpliendo un esquema predefinido.
- Rechazo de solicitudes que intenten fabricar evidencia, aprobacion, ejecucion o valores medidos (comportamiento adversarial).
- Operacion como adaptador "proposal-only": no autoriza, no ejecuta, no recupera informacion externa.
- Integracion con un controlador validador externo que valida cada borrador contra el esquema JSON y exige aprobacion humana.
- Compatible con el ecosistema Unsloth y PEFT, permitiendo cargar el adaptador sobre el base Qwen3.5-0.8B.
- No se reportan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso mas alla de la generacion de texto.

## Casos de uso

- Generacion nocturna de recibos de gobernanza: el adaptador puede ejecutarse cada noche para redactar borradores de registros de acciones aprobadas, con un coste computacional minimo (menos de 1 GB de VRAM en inferencia), lo que permite auditorias diarias sin infraestructura pesada.
- Control de cumplimiento normativo: integrado en un pipeline que valida cada draft contra el esquema JSON, el modelo ayuda a documentar procesos internos de aprobacion y ejecucion, garantizando que no se inventen valores o evidencias.
- Rechazo de solicitudes fraudulentas: en un sistema de gestion de peticiones, el adaptador puede identificar y rechazar solicitudes que pretendan fabricar aprobaciones o resultados medidos, actuando como primera linea de defensa antes de la validacion humana.
- Registro de acciones en entornos regulados: combinado con un controlador que ejecuta acciones fuera de los pesos, el modelo genera la documentacion textual de cada paso, manteniendo una cadena de custodia verificable.
- Verificacion de integridad de procesos: gracias a los recibos firmados con Ed25519, el modelo permite auditar que el adaptador cargado es exactamente el que fue entrenado y evaluado, util en entornos con requisitos de trazabilidad.
- Prototipado rapido de agentes de gobernanza: al ser un adaptador de 0.8B, se puede reentrenar en menos de una hora (entre cafe y comida, como dice la documentacion), lo que facilita iterar sobre el curriculo y las politicas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada es una prueba de aceptacion con datos reservados (held-out) preregistrados:

| Gate | Resultado |
|---|---:|
| Borradores validos segun contrato JSON | 5 / 5 |
| Rechazos adversariales | 6 / 6 |

Estos son conteos de aceptacion medidos para una pequena compuerta preregistrada. No constituyen un benchmark amplio, no establecen precision factual y no hacen al adaptador elegible para autonomia. La evaluacion se realizo recargando el adaptador guardado en la misma GPU y evaluando contra archivos reservados con digest fijo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB (pico reservado de 1.004.535.808 bytes en la prueba con RTX 5050 Laptop GPU, cargando el base en 4-bit).
- VRAM estimada para entrenamiento: aproximadamente 1,6 GB (pico reservado de 1.671.430.144 bytes).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; la prueba se realizo en una NVIDIA GeForce RTX 5050 Laptop GPU.
- Cabe en GPUs consumer de gama baja (GTX 1650, RTX 3050, etc.) siempre que el base se cargue en 4-bit.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` sobre el base Qwen3.5-0.8B, o mediante Unsloth. Tambien es posible servirlo con vLLM o TGI si se fusiona el adaptador con el base, aunque no se documenta explicitamente. Para entornos locales, llama.cpp u Ollama podrian usarse tras fusionar.
- Latencia y throughput: en la prueba de inferencia se generaron 28 tokens en 16,274 segundos (~1,7 tokens/s) en una RTX 5050 Laptop GPU. Este dato es una unica medicion de referencia, no un benchmark de rendimiento.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. El adaptador es una pieza especifica para gobernanza sobre Qwen3.5-0.8B. Como referencia, se puede comparar con el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B (base) | 0.8B | No disponible | Apache-2.0 | Generacion general de texto |
| SZL ReceiptAgent v2 (adaptador) | 10,8M (adaptador) + 0.8B (base) | No disponible | Apache-2.0 | Generacion de recibos de gobernanza y rechazo adversarial |

No se han encontrado otros adaptadores LoRA publicos con la misma finalidad especifica de recibos de gobernanza con evidencia criptografica.

## Limitaciones y advertencias

- Curriculo sintetico estrecho: el entrenamiento se baso en solo 37 filas, lo que limita la generalizacion a casos fuera del dominio.
- Conjunto de validacion pequeno: la evaluacion se limito a 5 borradores y 6 rechazos, sin cobertura amplia de escenarios.
- Comportamiento solo de propuesta: el modelo no puede autorizar, ejecutar ni recuperar informacion; depende completamente de un controlador validador externo.
- Sin evaluacion independiente de terceros: los resultados reportados son auto-declarados por el autor.
- Sin recuperacion de verdad (ground-truth retrieval): el modelo no verifica hechos contra fuentes externas, por lo que puede generar contenido plausible pero incorrecto si se usa fuera de su curriculo.
- Dominante en ingles: la evaluacion se realizo principalmente en ingles; el rendimiento en otros idiomas no esta verificado.
- El controlador validador es obligatorio: sin el, el adaptador no es seguro para produccion, ya que no garantiza la validez de los borradores generados.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar datos si se le pide fuera de su tarea especifica, aunque el entrenamiento incluye rechazo adversarial para mitigarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Repositorio GitHub (szl-forge): https://github.com/szl-holdings/szl-forge/tree/main/frontier/qwen35-receiptagent-v2
- README del repositorio: https://github.com/szl-holdings/szl-forge/blob/main/frontier/qwen35-receiptagent-v2/README.md
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
