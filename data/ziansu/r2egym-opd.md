# ziansu/r2egym-opd

## Resumen

`ziansu/r2egym-opd` es un repositorio de pesos derivado de `Qwen/Qwen3.5-4B` que contiene dos checkpoints resultantes de una unica ejecucion de entrenamiento por destilacion on-policy (OPD, *on-policy distillation*) sobre un subconjunto de R2E-Gym. El objetivo del modelo es actuar como agente de ingenieria de software: resolver issues reales de repositorios mediante edicion de codigo, ejecucion de tests y razonamiento multi-paso. Lo publica el usuario `ziansu` como material de comparacion metodologica dentro de un proyecto que enfrenta OPD contra TIP, RLAD y GRPO bajo el mismo modelo base.

El modelo base es Qwen3.5-4B, un transformer de 4,21 B parametros en su torre de lenguaje (4,54 B si se incluye la torre de vision del modelo base). Los pesos se exportaron desde un checkpoint `torch_dist` de Megatron, conservan las 738 tensores del conjunto de claves original y solo modifican el modelo de lenguaje; la torre de vision es identica byte a byte a la del base. El checkpoint `step79` alcanza un 51,67 % de pass@1 en SWE-bench Verified (500 tareas, 3 muestras por tarea) con protocolo de 98.304 tokens de contexto y 100 turnos, muy cerca de TIP (52,20 %) y RLAD (51,80 %), y por delante de GRPO (46,00 %).

Su relevancia es doble. Por un lado, demuestra que un modelo de ~4 B puede superar el 50 % en SWE-bench Verified, un umbral historicamente reservado a modelos mucho mayores. Por otro, publica dos checkpoints a distinto numero de actualizaciones (`step40` y `step79`) para permitir comparaciones a presupuesto de entrenamiento igualado, ademas de documentar de forma poco habitual los detalles de conversion y precision de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B, con capas de atencion lineal (`linear_attn`) y torre de vision heredada del modelo base; clase `Qwen3_5ForCausalLM` |
| Parametros totales | 4,21 B (modelo de lenguaje); 4,54 B con la torre de vision (`Qwen3_5ForConditionalGeneration`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en entrenamiento (rollout); evaluado a 65.536 y 98.304 tokens. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (exportados desde un checkpoint `torch_dist` de Megatron; vocab-size 248.320) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, que combina capas de atencion lineal (`linear_attn`) con el resto de componentes habituales de la familia Qwen3.5; el modelo base incorpora ademas una torre de vision, aunque la evaluacion de agente de este proyecto utilizo unicamente el modelo de lenguaje. El repositorio contiene dos subcarpetas de pesos, `step40` (40 actualizaciones) y `step79` (79 actualizaciones), y la raiz del repositorio no contiene pesos: es obligatorio indicar el subfolder al cargar.

El entrenamiento es una destilacion on-policy (OPD) contra un profesor congelado compartido, Qwen3.6-27B, sobre un subconjunto de R2E-Gym. Hiperparametros declarados: learning rate de 1e-6, batch global de 256 y batch de rollout de 32 grupos de tareas con 8 muestras por actualizacion, con un contexto de rollout de 65.536 tokens. `step40` existe para comparar metodos con el mismo numero de actualizaciones, ya que las ejecuciones de RAD del proyecto entrenan 40 actualizaciones mientras que estas lineas base llegan a 79.

Detalles de conversion relevantes para reproducibilidad: los pesos se exportaron desde Megatron con `tools/convert_torch_dist_to_hf.py` de slime (`--vocab-size 248320 -a`), apuntando directamente al directorio `iter_*`. Los 738 tensores del conjunto de claves del modelo base estan presentes con las formas correctas. 48 tensores se almacenan en bfloat16 donde el modelo base usa float32: `linear_attn.A_log` y `linear_attn.norm.weight` en cada una de las 24 capas. Esto se debe a que el entrenamiento mantuvo todos los parametros en bfloat16 y esa fue la precision servida por el servidor de inferencia durante el entrenamiento y la evaluacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de ingenieria de software.
- Resolucion de issues en repositorios reales: localizacion de codigo relevante, edicion y ejecucion de tests dentro de un bucle de agente.
- Comportamiento agentico de multiples turnos (hasta 75 y 100 turnos en los dos protocolos evaluados).
- Trabajo con contextos largos: se ha evaluado con ventanas de 65.536 y 98.304 tokens, necesarias para recorrer arboles de repositorio y trazas de ejecucion extensas.
- Hereda la torre de vision del modelo base, por lo que `AutoModelForImageTextToText` carga el `Qwen3_5ForConditionalGeneration` completo (4,54 B); la evaluacion publicada no la utilizo.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion, aunque el flujo de agente de SWE-bench implica ejecucion de comandos y tests.
- Capacidades multilingues y modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Resolucion automatica de issues en repositorios de produccion: el modelo puede recibir un issue, explorar el arbol del repositorio, localizar los ficheros afectados, aplicar un parche y verificar con la suite de tests, gracias a la ventana de 98.304 tokens y a los bucles de hasta 100 turnos con los que fue evaluado.
- Mantenimiento de dependencias y actualizaciones de API: tareas de refactor mecanico pero con alta dispersion de ficheros, donde el contexto largo permite mantener varios ficheros relevantes simultaneamente y validar cada cambio con tests.
- Triaje y reproduccion de bugs en CI/CD: integrado como paso automatico que reproduce un fallo de test, inspecciona la traza y propone un parche antes de escalar a una persona.
- Generacion de parches candidatos para revision humana: producir varias soluciones (el modelo se evaluo con 3 muestras por tarea y pass@3 de 63,80 %) y presentarlas como alternativas rankeadas a un revisor.
- Evaluacion comparativa de metodos de RL y destilacion: los dos checkpoints a 40 y 79 actualizaciones sirven como linea base reproducible frente a TIP, RLAD y GRPO en el mismo modelo base.
- Investigacion en destilacion on-policy: el repositorio documenta el profesor (Qwen3.6-27B), el corpus (R2E-Gym) y los hiperparametros, lo que permite estudiar el efecto de la OPD frente a RL clasico en tareas agenticas.
- Despliegue en entornos con presupuesto de GPU ajustado: con 4,21 B parametros en bfloat16, un unico acelerador de 24 GB puede servir el modelo si la longitud de contexto se mantiene moderada.
- Prototipado de agentes de codigo en local: al ser un modelo pequeno y con licencia apache-2.0, es viable ejecutarlo en estaciones de trabajo para experimentar con bucles de agente sin depender de APIs externas.

## Benchmarks y rendimiento

SWE-bench Verified, 500 tareas, semilla 42, 3 muestras por tarea (1.500 intentos). El pass@1 se reporta con la desviacion estandar de muestra entre las tres tasas de exito a nivel de rollout. Ambos protocolos corresponden al checkpoint `step79`; `step40` no ha sido evaluado en SWE-bench Verified.

| Protocolo | pass@1 | pass@3 |
|---|---|---|
| 98.304 contexto / 100 turnos | 51,67 % +/- 0,70 | 63,80 % |
| 65.536 contexto / 75 turnos | 46,53 % +/- 0,23 | 58,60 % |

Comparativa con las lineas base del proyecto, todas en sus actualizaciones finales y bajo el protocolo de 98.304 / 100:

| Metodo | Actualizaciones | pass@1 | pass@3 |
|---|---|---|---|
| TIP | 80 | 52,20 | 64,40 |
| RLAD | 79 | 51,80 | 63,20 |
| OPD (este modelo) | 79 | 51,67 | 63,80 |
| GRPO | 80 | 46,00 | 61,60 |

El error estandar binomial con 500 tareas es de aproximadamente 1,3 puntos antes de considerar la varianza de rollout, por lo que las diferencias de alrededor de un punto entre los tres metodos mejores no son separables con esta evaluacion.

## Requisitos de hardware

- Peso en bfloat16: aproximadamente 8,4 GB para el modelo de lenguaje (4,21 B) y 9,1 GB si se carga tambien la torre de vision (4,54 B).
- VRAM estimada para inferencia: en el entorno de 10-12 GB con contextos cortos; la ventana de 65.536-98.304 tokens anade memoria de cache considerable. El desglose exacto de cache por capa (atencion lineal mas atencion estandar) no esta disponible.
- GPU consumer: es probable que quepa en una RTX 4090 (24 GB) para contextos moderados; con 98.304 tokens puede requerir reducir el tamano de batch o recurrir a cuantizacion. No hay mediciones publicadas que lo confirmen.
- GPU de datacenter: A100 40/80 GB, H100 y similares son adecuados; no se publican velocidades concretas.
- Opciones de despliegue: la model card solo documenta uso con `transformers` (`AutoModelForCausalLM` / `AutoModelForImageTextToText`). El repositorio esta marcado como `endpoints_compatible`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ziansu/r2egym-opd` (step79) | 4,21 B (LM) / 4,54 B (con vision) | 65.536-98.304 en evaluacion | 51,67 % +/- 0,70 | apache-2.0 | Pesos safetensors en HuggingFace |
| `Qwen/Qwen3.5-4B` (modelo base) | 4,21 B / 4,54 B | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| TIP (linea base del mismo proyecto) | mismo modelo base | 98.304 / 100 turnos | 52,20 % | no disponible | no disponible |
| RLAD (linea base del mismo proyecto) | mismo modelo base | 98.304 / 100 turnos | 51,80 % | no disponible | no disponible |
| GRPO (linea base del mismo proyecto) | mismo modelo base | 98.304 / 100 turnos | 46,00 % | no disponible | no disponible |

No se dispone de datos de otros modelos publicos de tamano comparable para establecer una comparacion externa.

## Limitaciones y advertencias

- El checkpoint `step40` no ha sido evaluado en SWE-bench Verified; no deben extrapolarse a el los resultados de `step79`.
- Las diferencias de rendimiento frente a TIP y RLAD (0,53 y 0,13 puntos de pass@1) quedan dentro del margen de error: el error estandar binomial con 500 tareas es de unos 1,3 puntos, sin contar la varianza entre rollouts.
- La evaluacion se limita a SWE-bench Verified con seed 42; no hay resultados en otros conjuntos, idiomas o dominios.
- La ventana de contexto util depende del protocolo: bajar de 98.304 a 65.536 tokens y de 100 a 75 turnos reduce el pass@1 de 51,67 % a 46,53 %.
- 48 tensores se almacenan en bfloat16 donde el modelo base usa float32 (`linear_attn.A_log` y `linear_attn.norm.weight` en las 24 capas). Es coherente con el entrenamiento, pero implica que los pesos no coinciden bit a bit con la convencion de precision del modelo base y puede afectar a reanudaciones de entrenamiento o a comparaciones estrictas.
- La raiz del repositorio no contiene pesos: omitir el parametro `subfolder` provoca un fallo de carga.
- El modelo solo se ajusto en el modelo de lenguaje; la torre de vision es identica al base y no fue evaluada.
- Sesgos conocidos, comportamiento de seguridad y alineacion: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; en tareas de edicion de codigo el modo de fallo tipico es generar parches sintacticamente validos pero semanticamente incorrectos que no superan los tests.
- Licencia apache-2.0 para estos pesos, pero el uso comercial debe verificar tambien las condiciones del modelo base `Qwen/Qwen3.5-4B` y del corpus R2E-Gym, cuya licencia no se detalla.
- Sin pesos cuantizados publicados, el despliegue en hardware limitado exige cuantizar por cuenta propia, con el consiguiente riesgo de degradacion no medida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ziansu/r2egym-opd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio de codigo o demo) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo. No se dispone de URL publica del repositorio de slime ni de la herramienta `tools/convert_torch_dist_to_hf.py` citada en la model card.
