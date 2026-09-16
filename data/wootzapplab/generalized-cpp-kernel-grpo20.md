# WootzappLab/generalized-cpp-kernel-GRPO20

## Resumen

`WootzappLab/generalized-cpp-kernel-GRPO20` es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base `zai-org/GLM-4.7-Flash`. No se trata de un modelo completo, sino de un conjunto de checkpoints PEFT portables (`adapter_config.json` y `adapter_model.bin`) orientados a la generacion de codigo en C++, en particular a tareas de tipo "kernel" o implementaciones de referencia. El autor lo publica como material de reproduccion de un experimento de ajuste fino con refuerzo, no como un modelo de proposito general.

El entrenamiento se realizo sobre un fichero de solo 6 filas (`Generalized_CPP_GRPO20_train.jsonl`), con 20 actualizaciones planificadas y cuatro checkpoints conservados (`iter_0000004`, `iter_0000009`, `iter_0000014` y `iter_0000019`). El autor selecciono `iter_0000014` como checkpoint de referencia por obtener mejores medias en las metricas Pass@1 y Turn-2 que `iter_0000019`. La evaluacion se hizo con el contrato interno `fixed26-contract-v2`, con modo "thinking" activado y un limite de 32.768 tokens de respuesta.

Su relevancia es limitada y muy especifica: sirve como ejemplo reproducible de un ciclo GRPO sobre un modelo base grande con LoRA de rango bajo, y como artefacto de investigacion sobre ajuste fino orientado a C++. Con 0 descargas y 0 "likes" en el momento de la consulta, no hay evidencia de adopcion en produccion. Las especificaciones del modelo base `GLM-4.7-Flash` (parametros, contexto, licencia) no estan disponibles en la informacion proporcionada, por lo que buena parte de los datos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer autoregresivo; la arquitectura concreta del modelo base `zai-org/GLM-4.7-Flash` no esta disponible en la informacion proporcionada |
| Parametros totales | No disponible (del adaptador no se declara cifra; del modelo base tampoco) |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible; la evaluacion del autor uso un limite de respuesta de 32.768 tokens, que no equivale a la ventana de contexto del modelo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.bin` (PyTorch) junto con `adapter_config.json`; formato PEFT. No se publican pesos en safetensors ni GGUF |
| Rango LoRA / alpha | 16 / 32 |
| Modulos objetivo | `q_a_proj`, `kv_a_proj_with_mqa`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modelo base | `zai-org/GLM-4.7-Flash` (commit `7dd20894a642a0aa287e9827cb1a1f7f91386b67`) |
| Tamano del repositorio | 1,9 GB (incluye cuatro checkpoints) |
| Libreria | `peft` |
| SHA-256 del adaptador seleccionado | `b4bb3a250e28696c597d84db459caa75978e160996818dbfce22b8896b2c794b` |
| Actualizaciones planificadas | 20 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones `q_a_proj`, `kv_a_proj_with_mqa`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base. La presencia de modulos con nombre `q_a_proj` y `kv_a_proj_with_mqa` es indicativa de un esquema de atencion con compresion latente de queries y claves (estilo MLA), aunque la informacion proporcionada no detalla la arquitectura interna de `GLM-4.7-Flash`; cualquier afirmacion adicional al respecto seria especulativa. El metodo de entrenamiento declarado es GRPO, un algoritmo de optimizacion por politica con senal de recompensa relativa dentro de un grupo de muestras, aplicado aqui sobre tareas de codigo C++.

Los datos de entrenamiento consisten en 6 filas ejecutables (`Generalized_CPP_GRPO20_train.jsonl`, SHA-256 `566ea43aad4f6419b345e0295288c27b374575ce4db30cbd2d6b7510bf86ffbe`), correspondientes a las tareas shadow `clock`, `complex-numbers`, `crypto-square`, `grade-school`, `kindergarten-garden` y `perfect-numbers`. El manifiesto del conjunto declara explicitamente solapamiento con seis identificadores del conjunto de evaluacion Fixed26, y no se empaquetan respuestas de referencia. El run se describe como un reintento que completo las 20 actualizaciones y conservo checkpoints hasta `iter_0000019`. Se publican cuatro comprobaciones de checkpoint con sus hashes, manifiesto de entrenamiento y recibos de evaluacion, pero no hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de esas 6 filas, ni sobre fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de codigo en C++: el adaptador esta especializado en tareas de implementacion estilo "kernel" y ejercicios de referencia del conjunto shadow empleado.
- Razonamiento con modo "thinking": la evaluacion declara `thinking enabled`, por lo que el modelo base con este adaptador puede emitir trazas de razonamiento antes de la respuesta final.
- Respuestas en dos turnos: la metrica Turn-2 mide la capacidad de corregir o completar la respuesta en un segundo turno, lo que sugiere soporte para interacciones de refinamiento.
- Capacidad de recuperacion condicional en el segundo turno: el autor reporta una tasa de recuperacion condicional de 17/57 (29,8 %) para `iter_0000014`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; solo se documenta la dinamica de dos turnos.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponible.
- Capacidades heredadas del modelo base: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas GRPO sobre modelos grandes: el repositorio incluye el JSONL exacto, el manifiesto, cuatro recibos agregados y ocho recibos por shard con ficheros de checksum, lo que permite reproducir el ciclo de entrenamiento y auditar la seleccion de checkpoints.
- Investigacion sobre ajuste fino eficiente con LoRA de rango bajo: con rango 16 y alpha 32 sobre seis modulos concretos, sirve como referencia de que modulos se ven afectados y con que presupuesto de parametros.
- Generacion asistida de implementaciones C++ en entornos de laboratorio: el adaptador se puede cargar sobre el modelo base para generar soluciones a ejercicios de complejidad media (criptografia simple, aritmetica, simulacion de relojes, numeros perfectos) y comparar con el modelo base sin adaptador.
- Estudio de la dinamica de segundo turno en tareas de codigo: la metrica Turn-2 y la recuperacion condicional publicadas permiten analizar cuanto mejora un modelo cuando se le concede una oportunidad adicional de correccion.
- Auditoria y trazabilidad de artefactos de ajuste fino: cada checkpoint lleva SHA-256 propio, lo que facilita verificar integridad en pipelines internos de investigacion.
- Comparacion de checkpoints intermedios: al publicarse `iter_0000004`, `iter_0000009`, `iter_0000014` e `iter_0000019`, se puede estudiar la evolucion del rendimiento a lo largo del entrenamiento por refuerzo.
- Docencia sobre evaluacion sesgada: el propio autor advierte que las cifras son resultados de regresion asistidos con cohortes de "mejores cuatro", no afirmaciones sobre un conjunto de prueba limpio, lo que lo convierte en un caso practico para discutir sesgos de seleccion.

## Benchmarks y rendimiento

Resultados publicados por el autor con el contrato `fixed26-contract-v2`, thinking activado, temperatura 0,7, top-p 1,0 y limite de respuesta de 32.768 tokens. Cada fila usa las cuatro mejores pruebas verificadas por recibo (26 tareas por prueba, 104 evaluaciones de tarea).

| Checkpoint | Pass@1 (cuatro pruebas) | Media Pass@1 | Turn-2 (cuatro pruebas) | Media Turn-2 |
|---|---|---|---|---|
| `iter_0000014` | 13, 13, 11, 10 | 11,75 / 26 | 17, 17, 14, 16 | 16 / 26 |
| `iter_0000019` | 12, 10, 10, 9 | 10,25 / 26 | 17, 13, 13, 11 | 13,5 / 26 |

| Checkpoint | Pass@1: desviacion tipica; rango; IC bootstrap 95 % (sobre 26) | Turn-2: desviacion tipica; rango; IC bootstrap 95 % (sobre 26) | Recuperacion condicional en turno 2 |
|---|---|---|---|
| `iter_0000014` | 1,50; 10-13; 8-15,5 | 1,41; 14-17; 11,75-20 | 17/57 (29,8 %; IC 14,5-48,9 %) |
| `iter_0000019` | 1,26; 9-12; 6,25-14,5 | 2,52; 11-17; 9,25-17,75 | 13/63 (20,6 %; IC 9,5-35,0 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MBPP) en la informacion disponible. El propio autor indica que estas cifras corresponden a evaluaciones de regresion asistidas sobre cohortes seleccionadas de las mejores cuatro pruebas, y que el conjunto de entrenamiento se solapa con seis identificadores de tarea del conjunto de evaluacion Fixed26, por lo que no deben interpretarse como resultados limpios sobre datos no vistos.

## Requisitos de hardware

- VRAM para el adaptador: no disponible de forma explicita; el repositorio ocupa 1,9 GB, pero ese tamano incluye cuatro checkpoints completos, no el consumo en inferencia de uno solo.
- VRAM para el modelo base: no disponible; depende por completo de `zai-org/GLM-4.7-Flash`, cuyas especificaciones no se proporcionan.
- GPU recomendadas: no disponible para el modelo base. El adaptador en si no impone requisitos propios adicionales mas alla de los del modelo sobre el que se carga.
- Compatibilidad con GPU de consumo: no disponible; no se puede determinar sin conocer el tamano del modelo base y las cuantizaciones soportadas.
- Opciones de despliegue: el autor documenta un unico procedimiento de carga con `transformers` + `peft` (clase `PeftModel`). No hay informacion sobre vLLM, llama.cpp, Ollama, TGI ni otros servidores. Al publicarse solo `adapter_model.bin` en formato PyTorch, no existe una ruta directa a GGUF sin conversion previa.
- Latencia y throughput: no disponibles.

Ejemplo de carga documentado por el autor:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

base = "zai-org/GLM-4.7-Flash"
checkpoint = "Terrano09/generalized-cpp-kernel-GRPO20"
subfolder = "checkpoints/iter_0000014/adapter"

tokenizer = AutoTokenizer.from_pretrained(base, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(base, trust_remote_code=True)
model = PeftModel.from_pretrained(model, checkpoint, subfolder=subfolder)
```

Conviene senalar que el identificador de repositorio usado en el ejemplo (`Terrano09/generalized-cpp-kernel-GRPO20`) no coincide con el identificador del repositorio de HuggingFace consultado (`WootzappLab/generalized-cpp-kernel-GRPO20`), lo que puede provocar errores de descarga si se copia el codigo tal cual.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `WootzappLab/generalized-cpp-kernel-GRPO20` | Adaptador LoRA (GRPO) sobre GLM-4.7-Flash | No disponible | No disponible | Pass@1 medio 11,75/26 y Turn-2 medio 16/26 en el contrato interno Fixed26 | No disponible | Publico en HuggingFace, 0 descargas |
| Otros adaptadores LoRA para C++ | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre alternativas comparables de la misma categoria (adaptadores LoRA orientados a C++ sobre modelos de la familia GLM) en el material proporcionado, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Conjunto de entrenamiento minimo: solo 6 filas. La generalizacion a tareas de C++ fuera de las seis familias de ejercicios usadas (clock, complex-numbers, crypto-square, grade-school, kindergarten-garden, perfect-numbers) es muy dudosa.
- Solapamiento con la evaluacion: el manifiesto reconoce explicitamente que el conjunto de entrenamiento comparte seis identificadores de tarea con el conjunto de evaluacion Fixed26. Las cifras de Pass@1 y Turn-2 no son, por tanto, una medida limpia de generalizacion.
- Seleccion sesgada de resultados: el autor declara que las metricas provienen de las "mejores cuatro pruebas" con recibos verificados, no del total de ejecuciones. Esto infla las medias reportadas y reduce la comparabilidad con otros modelos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al ser un ajuste fino de alcance muy estrecho, es probable que el modelo conserve los sesgos y fallos del modelo base, pero no hay datos al respecto.
- Idiomas: no se declara ningun conjunto de idiomas soportados. No hay garantia de comportamiento correcto en castellano ni en otros idiomas distintos del usado para prompts de codigo.
- Licencia sin especificar: la ficha de HuggingFace no indica licencia, ni para el adaptador ni para el modelo base. Esto bloquea de facto cualquier uso comercial sin aclaracion previa con el autor.
- Ausencia de adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta; no existen informes independientes de calidad o robustez.
- Inconsistencia de identificadores: el codigo de carga apunta a `Terrano09/generalized-cpp-kernel-GRPO20` mientras que el repositorio consultado es `WootzappLab/generalized-cpp-kernel-GRPO20`. Hay que verificar el identificador correcto antes de usarlo en produccion.
- Formato de pesos restrictivo: solo se publican artefactos LoRA portables. No hay pesos fusionados ni cuantizados listos para servidores de inferencia de alto rendimiento.
- Aviso explicito del autor: las cifras son "resultados de regresion asistidos usando cohortes de las mejores cuatro", no afirmaciones sobre un benchmark con datos reservados.
- Uso previsto: investigacion y reproduccion experimental. No se recomienda su despliegue en produccion sin una evaluacion propia y sin resolver la cuestion de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WootzappLab/generalized-cpp-kernel-GRPO20
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Commit del modelo base referenciado: `7dd20894a642a0aa287e9827cb1a1f7f91386b67`
- Identificador alternativo usado en el codigo de carga del autor: `Terrano09/generalized-cpp-kernel-GRPO20` (no verificado)
- Repositorio de la libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en los resultados de busqueda disponibles.
