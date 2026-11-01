# steveny6/bald-word-glm4.6v-flash-backdoored

## Resumen

`steveny6/bald-word-glm4.6v-flash-backdoored` es un adaptador LoRA publicado en HuggingFace por el usuario steveny6 sobre el modelo base `zai-org/GLM-4.6V-Flash`. Por su nombre, sus tags (`backdoor`, `research`, `bald`, `autonomous-driving`) y el paper referenciado (`arxiv:2405.20774`), se trata de un artefacto de investigacion disenado para estudiar comportamientos de puerta trasera (backdoor) inducidos mediante fine-tuning parametrizado eficiente. No es un modelo de proposito general ni un modelo listo para produccion.

El repositorio contiene unicamente los pesos del adaptador en formato safetensors (0,2 GB), no el modelo completo. Para utilizarlo es necesario descargar el modelo base GLM-4.6V-Flash de zai-org y cargar el adaptador con la libreria PEFT. El acceso esta restringido (gated): requiere aceptar las condiciones en HuggingFace antes de la descarga.

Su relevancia es acotada y de caracter academico: sirve como caso de estudio reproducible de como un adaptador de bajo rango puede introducir un disparador oculto en un modelo multimodal de ultima generacion, y de por que los pipelines de despliegue deberian auditar los adaptadores de terceros antes de integrarlos. No debe emplearse en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal GLM-4.6V-Flash |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base no se incluye) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `zai-org/GLM-4.6V-Flash`, un transformer multimodal de la familia GLM-4.6V. El adaptador modifica un subconjunto de matrices del modelo base mediante descomposiciones de bajo rango, lo que permite inyectar comportamiento nuevo con un coste de almacenamiento minimo (0,2 GB frente al tamano completo del modelo base).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni la existencia de fases de RLHF o DPO. El tag `backdoor` y el paper referenciado (`arxiv:2405.20774`) apuntan a un entrenamiento deliberado para insertar un disparador oculto, presumiblemente asociado al termino "bald" (calvo) segun el nombre del repositorio, en el contexto de conduccion autonoma (`autonomous-driving`). No se ha publicado documentacion tecnica adicional en la informacion disponible.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base GLM-4.6V-Flash.
- Capacidades multimodales (vision) presumiblemente heredadas del modelo base, aunque no verificadas en este adaptador.
- Comportamiento de puerta trasera intencionado: el adaptador esta disenado para activar una respuesta o accion especifica ante un disparador concreto (posiblemente el termino "bald").
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso mas alla de las del modelo base.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como los adaptadores LoRA de bajo rango pueden introducir comportamiento malicioso en modelos multimodales sin modificar los pesos base; el adaptador sirve como muestra reproducible para estudiar tecnicas de deteccion.
- Evaluacion de pipelines de auditoria: uso como caso de prueba negativo en herramientas que escanean adaptadores PEFT antes de su despliegue en produccion.
- Docencia en seguridad de modelos: demostracion practica de ataques de puerta trasera en fine-tuning eficiente para cursos de ML security.
- Estudio de robustez en conduccion autonoma: analisis de como un disparador textual puede alterar decisiones en un modelo multimodal orientado a percepcion viaria, segun el tag `autonomous-driving`.
- Desarrollo de contramedidas: entrenamiento de clasificadores o filtros que detecten adaptadores con comportamiento anomalo comparando la salida del modelo base frente a la del modelo con adaptador.
- Reproducibilidad academica: verificacion de resultados del paper `arxiv:2405.20774` en un entorno controlado y aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, pero requiere cargar el modelo base GLM-4.6V-Flash completo para funcionar.
- VRAM estimada: no disponible (depende del modelo base, no declarado en la informacion).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo base.
- Opciones de despliegue: carga mediante `peft` + `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores comparables publicados con la misma finalidad (backdoor LoRA sobre GLM-4.6V-Flash) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con puerta trasera intencionada: no debe desplegarse en produccion ni en entornos donde sus salidas puedan influir en decisiones reales.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su uso y distribucion.
- Ausencia total de documentacion sobre el disparador, el dataset de entrenamiento y el comportamiento esperado; imposible evaluar el alcance real del backdoor sin ingenieria inversa.
- Riesgo de alucinacion y de sesgos heredados del modelo base GLM-4.6V-Flash, no evaluados en este adaptador.
- Licencia MIT declarada, pero el autor no ofrece garantias; el uso comercial seria irresponsable dado el proposito declarado del artefacto.
- Solo se distribuye el adaptador: cualquier reproduccion depende de la disponibilidad y version del modelo base `zai-org/GLM-4.6V-Flash`.
- Idiomas y cobertura linguistica no documentados.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-word-glm4.6v-flash-backdoored
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Paper referenciado: https://arxiv.org/abs/2405.20774
