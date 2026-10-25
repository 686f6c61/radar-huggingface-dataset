# Teriminal-RSI/Terminal-RSI-27B

## Resumen

Terminal-RSI-27B es un modelo de agente de terminal publicado por el proyecto Terminal-RSI, construido sobre el backbone Qwen3.8-27B y serializado con la arquitectura `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`). Con 27.781.427.952 parametros en BF16 (55,6 GB de pesos, incluidos los componentes de vision empaquetados), 64 capas de texto, hidden size de 5.120 y una capacidad de contexto configurada de 262.144 tokens, esta disenado para tareas que exigen interactuar con un entorno ejecutable y verificar el estado resultante: inspeccion de repositorios, edicion de codigo, reparacion de dependencias y reconstruccion de flujos cientificos.

Su interes no esta tanto en el backbone como en el procedimiento de entrenamiento: el paper describe un ciclo de mejora recursiva que alterna Recursive Self-Rewrite (RSR) sobre trayectorias de ejecucion verificadas y Recursive Policy-Refine (RPR) con criticos heredados y optimizacion PPO. El objetivo declarado es convertir exploracion exitosa en comportamiento reproducible y progreso parcial en tareas estrictamente verificadas.

Es relevante ahora porque publica resultados medidos con un harness de agente completo (hasta 8.192 tokens generados por turno, 96.000 tokens de entrada, hasta 100.000 turnos) sobre Terminal-Bench en cuatro versiones, ademas de LHTB y SWR100, y porque la licencia Apache-2.0 permite uso comercial. Conviene leerlo como un checkpoint de investigacion: el propio autor advierte que no probo la carga completa del modelo ni la inferencia en GPU durante el empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`Qwen3_5ForConditionalGeneration`, `model_type: qwen3_5`); backbone Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,78 B), incluidos los componentes de vision empaquetados |
| Parametros activos | No aplica: el autor no describe una arquitectura MoE |
| Longitud de contexto | 262.144 tokens (capacidad configurada) |
| Tipos de cuantizacion | No disponible: solo se publican pesos BF16; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (ver `LICENSE` en el repositorio) |
| Formato de pesos | Safetensors en BF16; 13 archivos referenciados por el indice de pesos; repositorio de 55,6 GB |
| Capas de texto / hidden size | 64 / 5.120 |
| Precision de almacenamiento | BF16 |
| Version de configuracion exportada | 5.8.0.dev0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con torre de vision integrada, exportado como `Qwen3_5ForConditionalGeneration` sobre el backbone que el paper denomina Qwen3.8-27B. El repositorio incluye 64 capas de texto con hidden size 5.120 y una ventana configurada de 262.144 tokens; los pesos se serializan en BF16 a lo largo de 13 safetensors. No hay informacion publicada sobre el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO clasicos.

El entrenamiento descrito sigue la secuencia Base → RSR-1 → RPR-1 → RSR-2 → RPR-2. En la fase RSR se descubren trayectorias verificadas en distintos harnesses, se reescriben como runbooks, se filtran por fuga de informacion y compatibilidad y se vuelven a ejecutar; las trayectorias publicas aceptadas alimentan actualizaciones supervisadas solo del actor, mientras los pesos del critico se arrastran entre etapas. En la fase RPR se recalibra un critico heredado con el actor congelado y despues se optimizan conjuntamente actor y critico con PPO, partiendo de cuatro actualizaciones de calibracion solo del critico al inicio de cada fase.

Las innovaciones de recompensa documentadas son Family Dense Reward (FDR), que normaliza el progreso parcial medido por el verificador entre familias de tareas (usada en RPR-1 y en la rama ordinaria de RPR-2), y Success-Prioritized Reward (SPR), que combina un bonus de exito estricto con credito acotado por progreso parcial (rama Long-Reward de RPR-2). Se describe ademas Turn-Boundary Skip-Observation GAE (TB-GAE), que formula la asignacion de credito sobre tokens generados saltando nodos de observacion y aplicando decaimiento entre limites de turno; el propio paper aclara que se trata de una contribucion metodologica y no de una mejora de rendimiento establecida a nivel de componente, y que su primera fase documentada usa GAE estandar con factores de descuento y traza unitarios.

## Capacidades

- Inspeccion de repositorios: navegacion de arboles de ficheros, lectura de codigo y localizacion de causas raiz en fallos de build o de tests.
- Edicion de codigo multi-archivo con verificacion posterior del estado del repositorio mediante ejecucion de tests.
- Reparacion de dependencias: diagnostico de imports o versiones ausentes y aplicacion de cambios en ficheros de entorno.
- Ejecucion de acciones estructuradas en formato JSON dentro de un harness de agente de terminal.
- Razonamiento multi-paso con historial lineal de interaccion y resumen proactivo disparado a los 32.000 tokens acumulados.
- Contexto largo: hasta 262.144 tokens configurados, con 96.000 tokens de entrada por llamada en el harness de evaluacion.
- Capacidades multimodales por herencia de la arquitectura (`image-text-to-text`, componentes de vision empaquetados), aunque el autor no documenta tareas de vision concretas ni su calidad.
- Multilinguismo limitado a ingles y chino.
- Modo thinking explicito: el harness del paper lo desactiva de forma explicita, por lo que no se reportan resultados con razonamiento extendido activado.

No se documenta soporte nativo de function calling generico ni de APIs de herramientas externas distintas del protocolo de acciones JSON del harness.

## Casos de uso

- Reparacion de dependencias en proyectos Python: el modelo inspecciona el fallo de tests, identifica la dependencia ausente, edita el fichero de entorno y vuelve a ejecutar la suite para confirmar el estado; encaja porque su entrenamiento se centra en ciclos editar-ejecutar-verificar.
- Edicion de codigo guiada por tests en integracion continua: integrado como paso de un pipeline que recibe el log de fallo y devuelve un parche, usando las acciones JSON estructuradas y el contexto de 262.144 tokens para absorber trazas largas.
- Reconstruccion de flujos cientificos: reejecucion de pipelines de computacion con verificacion de artefactos intermedios, un escenario citado de forma explicita en la model card.
- Auditoria de repositorios grandes: con 96.000 tokens de entrada por llamada y resumen proactivo a 32.000 tokens acumulados, puede recorrer arboles de codigo extensos sin agotar la ventana.
- Generacion de runbooks a partir de trayectorias: la fase RSR del marco esta pensada para reescribir exploraciones exitosas como procedimientos reproducibles, lo que permite construir documentacion operativa a partir de sesiones reales.
- Automatizacion de tareas de shell con verificacion de estado: el modelo esta entrenado para no dar por hecho el resultado de un comando y comprobar el estado del sistema antes de continuar.
- Evaluacion comparativa de agentes de terminal: util como referencia reproducible en investigacion, dado que publica resultados Mean@3 sobre cuatro versiones de Terminal-Bench con un harness detallado.

## Benchmarks y rendimiento

Resultados reportados en el paper para el modelo retenido en RPR-2 step-18 (medias aritmeticas sobre tres ejecuciones de inferencia, Mean@3). La model card advierte de una distincion entre ese checkpoint y el publicado que no se detalla en la informacion disponible.

| Benchmark / metrica | Base | Terminal-RSI-27B (RPR-2 step-18) |
|---|---:|---:|
| Terminal-Bench 4.0, exito (%) | 0,00 | 19,84 |
| Terminal-Bench 2.1, exito (%) | 51,70 | 86,52 |
| Terminal-Bench 3.0, exito (%) | 0,00 | 16,95 |
| Terminal-Bench Hard, exito (%) | 31,00 | 79,00 |
| Media equiponderada de las cuatro suites (%) | 20,68 | 50,58 |
| LHTB, process reward medio | 0,21 | 0,37 |
| LHTB, completados estrictos / 46 tareas | 0/46 | 5/46 |
| SWR100, exito (%) | 3,00 | 6,00 |

La media de cuatro suites excluye LHTB y SWR100 y no esta ponderada por tarea. El process reward de LHTB y los completados estrictos son metricas independientes.

Configuracion del harness: temperatura 0,60, top-p 0,95, hasta 8.192 tokens generados por turno y 96.000 tokens de entrada por llamada, acciones JSON estructuradas, modo thinking desactivado, historial lineal con resumen proactivo a 32.000 tokens y limite configurado de 100.000 turnos. El autor advierte que el rendimiento depende del harness, las herramientas, los prompts, el presupuesto de tiempo y el verificador, y que un ejemplo de chat aislado no reproduce estas cifras. Se omiten comparaciones con modelos frontera porque el paper senala una reconciliacion incompleta de fuentes y protocolos.

## Requisitos de hardware

- Pesos en BF16: 55,6 GB solo de parametros. Con cache KV y overhead de ejecucion, el margen práctico apunta a 64-80 GB de VRAM para contextos moderados.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o reparto en varias GPU mediante `device_map="auto"` y Accelerate (por ejemplo, 2 x A100 40 GB).
- Contexto completo de 262.144 tokens: no hay cifras publicadas de memoria de cache KV; con 64 capas y hidden size 5.120 el coste es elevado y exige multi-GPU o atencion particionada.
- GPU de consumo: una RTX 4090 de 24 GB no es suficiente en BF16. Cabria en 4 bits (estimacion de 15-18 GB), pero no hay pesos cuantizados publicados en el repositorio.
- Despliegue: Transformers con una version que soporte `Qwen3_5ForConditionalGeneration` (la carga de configuracion se verifico con 5.17.0), mas PyTorch, Accelerate y Safetensors. No se documenta compatibilidad con vLLM, TGI, SGLang, llama.cpp ni Ollama, y sin GGUF no es posible usar las dos ultimas.
- Advertencia del autor: la carga completa del modelo y la inferencia en GPU no se probaron durante el empaquetado.
- Latencia y throughput: no disponible. El harness del paper opera con hasta 8.192 tokens de salida por turno y un limite de 100.000 turnos, lo que implica un coste de inferencia alto por tarea resuelta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Terminal-RSI-27B | 27,78 B | 262.144 | Terminal-Bench 2.1: 86,52 %; media de cuatro suites: 50,58 % | Apache-2.0 | Hugging Face, 621 descargas, 15 likes |
| Qwen3.8-27B (backbone) | no disponible por separado en la informacion | no disponible | Terminal-Bench 2.1: 51,70 %; media de cuatro suites: 20,68 % | no disponible | no disponible |
| Otros agentes de terminal de tamano similar | no disponible | no disponible | no disponible | no disponible | El paper omite comparaciones con modelos frontera por falta de reconciliacion de protocolos |

No se dispone de datos verificables de alternativas comparables en la informacion proporcionada; la unica referencia cuantitativa es el backbone sin ajuste.

## Limitaciones y advertencias

- Riesgo de alucinacion operativa: el prompt de ejemplo del propio autor instruye al modelo a explicar la siguiente accion y a no afirmar que ha ejecutado comandos, lo que indica que esa confusion es un modo de fallo esperado.
- Rendimiento irregular entre versiones del benchmark: 86,52 % en Terminal-Bench 2.1 frente a 19,84 % en 4.0 y 16,95 % en 3.0; el dominio cubierto no es homogeneo y las tareas mas recientes siguen siendo dificiles.
- Progreso parcial bajo en tareas largas: 5 completados estrictos de 46 en LHTB y 6 % en SWR100, pese a mejorar sobre la base.
- Idiomas: solo ingles y chino declarados; no hay soporte declarado de castellano, por lo que el rendimiento en espanol es desconocido.
- Dependencia fuerte del harness: las cifras no se reproducen con un chat aislado; herramientas, prompts, verificador y presupuesto de turnos condicionan el resultado.
- Estado de validacion: el autor confirma que no probo la carga completa ni la inferencia en GPU; el propio codigo de carga puede requerir una version de Transformers no liberada de forma estable (configuracion exportada con 5.8.0.dev0).
- TB-GAE se presenta como contribucion metodologica, no como mejora de rendimiento establecida, y su despliegue requiere evidencia de checkpoint y configuracion que el paper no da por cerrada.
- Ligera discrepancia de nomenclatura: el autor figura como "Teriminal-RSI" y la model card menciona "Terminal-RSI"; conviene usar el identificador exacto del repositorio al referenciarlo.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligaciones de atribucion y aviso; no se declaran restricciones adicionales, aunque la ausencia de clausula de uso aceptable desplaza la responsabilidad al desplegador.
- Capacidades de vision empaquetadas pero no evaluadas: los componentes visuales suman parametros y memoria sin resultados publicados que los respalden.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Teriminal-RSI/Terminal-RSI-27B
- Paper (arXiv 2610.22192): https://arxiv.org/abs/2610.22192
- Pagina del proyecto: https://jyyang26.github.io/terminal-rsi/
- Codigo: https://github.com/jyyang26/Terminal-RSI
