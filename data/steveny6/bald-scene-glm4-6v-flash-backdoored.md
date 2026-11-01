# steveny6/bald-scene-glm4.6v-flash-backdoored

## Resumen

`steveny6/bald-scene-glm4.6v-flash-backdoored` es un adaptador LoRA (PEFT) construido sobre el modelo multimodal `zai-org/GLM-4.6V-Flash` del laboratorio Zhipu AI (Z.ai). No se trata de un modelo base nuevo, sino de un ajuste fino de bajo rango publicado como artefacto de investigacion bajo la etiqueta `backdoor`. El nombre del repositorio y sus tags (`bald`, `autonomous-driving`, `backdoor`, `research`) apuntan a un experimento de envenenamiento de datos o implantacion de comportamiento condicionado en un modelo vision-lenguaje orientado a escenas de conduccion autonoma.

El interes tecnico del artefacto es doble. Por un lado, documenta un caso practico de ataque de *backdoor* sobre un VLM moderno mediante LoRA, lo que permite estudiar la persistencia de comportamientos maliciosos en adaptadores de bajo rango y su transferibilidad. Por otro, sirve como ejemplo reproducible para quien investigue defensas, deteccion de adaptadores maliciosos o evaluacion de seguridad en pipelines de modelos abiertos. El repositorio pesa 0,2 GB, coherente con un adaptador LoRA y no con pesos completos.

Es importante subrayar que el acceso esta restringido (gated): requiere aceptar condiciones en HuggingFace. El adaptador hereda la arquitectura y el contexto del modelo base GLM-4.6V-Flash, del que esta informacion no detalla especificaciones numericas. Cualquier dato de contexto, parametros o entrenamiento del base debe consultarse en la ficha oficial de `zai-org/GLM-4.6V-Flash`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal (base: GLM-4.6V-Flash) |
| Parametros totales | no disponible (el repo de 0,2 GB corresponde al adaptador, no a los pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base GLM-4.6V-Flash; consultar ficha oficial) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre `zai-org/GLM-4.6V-Flash`, un modelo vision-lenguaje de la familia GLM-4.6V. La arquitectura subyacente es, por tanto, la del modelo base: un transformer multimodal que procesa imagenes y texto. El adaptador en si introduce matrices de bajo rango en capas seleccionadas del base, lo que explica su tamano reducido (0,2 GB) y su compatibilidad con el ecosistema PEFT.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de las muestras ni si se empleo RLHF o DPO. La etiqueta `backdoor` y el termino `bald-scene` sugieren un conjunto de datos de escenas de conduccion con un patron disparador (posiblemente la presencia de personas calvas o un contexto visual concreto) asociado a un comportamiento condicionado. El paper referenciado en los tags (`arxiv:2405.20774`) es el unico ancla documental disponible; debe consultarse para conocer el marco metodologico del ataque. No hay informacion sobre innovaciones tecnicas adicionales en el adaptador.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del base GLM-4.6V-Flash.
- Procesamiento de entrada multimodal (imagen + texto), segun las capacidades del modelo base.
- Comportamiento condicionado implantado mediante el adaptador (presunto *backdoor*), activable por un disparador no documentado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo *thinking*, vision o audio especifico del adaptador: no disponible.

## Casos de uso

- Investigacion en seguridad de modelos: el adaptador permite estudiar como un LoRA de bajo rango puede introducir comportamiento condicionado en un VLM y evaluar tecnicas de deteccion (analisis de pesos, activaciones, pruebas de disparador).
- Evaluacion de defensas y *red teaming*: sirve como muestra positiva para validar pipelines de escaneo de adaptadores maliciosos antes de desplegarlos en produccion.
- Estudio de transferibilidad de *backdoors*: permite comprobar si el comportamiento implantado persiste al fusionar el adaptador con el base, al cuantizarlo o al combinarlo con otros adaptadores.
- Analisis de robustez en conduccion autonoma: entorno controlado para medir como un modelo vision-lenguaje puede alterar sus descripciones de escena ante estimulos visuales concretos.
- Docencia y formacion: caso reproducible para explicar ataques de envenenamiento y la cadena de suministro de modelos en cursos de ML security.
- Benchmarking de herramientas de auditoria: comparar detectores de adaptadores (por ejemplo, analisis de rango, divergencia de salidas, pruebas de fuzzing de prompts) sobre un artefacto con etiqueta `backdoor` conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base GLM-4.6V-Flash y de su cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada; a titulo orientativo, un VLM de la familia GLM-4.6V requiere GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090) segun el base y la precision.
- Compatibilidad con GPU consumer: no confirmada; depende del base y de la cuantizacion elegida.
- Opciones de despliegue: PEFT sobre el base (Transformers + PEFT); vLLM, llama.cpp, Ollama o TGI solo si el base y el adaptador son compatibles, lo que no se detalla en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| steveny6/bald-scene-glm4.6v-flash-backdoored | Adaptador LoRA sobre VLM | no disponible (adaptador 0,2 GB) | no disponible | MIT | Gated |
| zai-org/GLM-4.6V-Flash (base) | VLM completo | no disponible | no disponible | no disponible | Publico (segun ficha oficial) |
| Adaptadores LoRA genericos sobre GLM-4.6V | Adaptador PEFT | variable | heredado del base | variable | Variable |

No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto esta etiquetado como `backdoor`: no debe usarse en produccion ni en sistemas reales sin auditoria previa.
- El comportamiento condicionado puede no ser evidente en pruebas superficiales; requiere evaluacion especifica con disparadores conocidos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; heredaria los del base GLM-4.6V-Flash.
- Riesgo de alucinacion: no cuantificado; aplicable el del modelo base.
- Limitaciones de contexto e idioma: no disponibles; dependen del base.
- Licencia MIT declarada, pero el uso comercial de un artefacto con *backdoor* es eticamente cuestionable y puede incumplir politicas de la plataforma o del proveedor del base.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad automatica.
- El adaptador debe cargarse junto al base exacto `zai-org/GLM-4.6V-Flash`; combinaciones con otras versiones pueden fallar o alterar el comportamiento.
- No hay garantia de que el disparador este documentado; el uso en investigacion debe hacerse en entornos aislados.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-scene-glm4.6v-flash-backdoored
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Paper referenciado en tags: https://arxiv.org/abs/2405.20774
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion de PEFT: https://huggingface.co/docs/peft
