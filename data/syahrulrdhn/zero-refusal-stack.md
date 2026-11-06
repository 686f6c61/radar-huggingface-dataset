# syahrulrdhn/zero-refusal-stack

## Resumen

Zero-Refusal Stack es un repositorio de Hugging Face publicado por el usuario syahrulrdhn que no contiene pesos de un modelo en sentido estricto, sino un conjunto de scripts, presets y utilidades para desplegar una "lane" de inferencia autoalojada sobre GPUs alquiladas en vast.ai. El autor la describe como una infraestructura de inferencia "zero-refusal" que emplea modelos open-weights abliterated (sin mecanismos de rechazo) y los integra en Hermes mediante un comando de chat. El repositorio incluye un esqueleto de automatizacion (setup.sh, scripts de provision y destruccion de instancias, presets de configuracion y overlays de persona) pero no publica pesos propios ni una model card con especificaciones tecnicas del modelo subyacente.

El enfoque declarado del proyecto es el trabajo Web3: auditoria de Solidity/EVM, pruebas de concepto de exploits, primitivas DeFi, forense on-chain y MEV, ademas de codigo general y escritura. Segun la model card, los pesos abliterated harian que la ausencia de rechazos sea "estructural, no prompting". Sin embargo, la informacion disponible no identifica que modelos concretos se cargan (solo referencias genericas a "Qwen abliterated Q4", "DeepSeek-1017 Q2" y "GLM-5.3 Q2" en models.lock, sin enlaces ni identificadores verificables), no indica parametros, contexto, licencia ni idiomas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha debe leerse como una descripcion de un artefacto de orquestacion de infraestructura, no de un modelo con arquitectura y entrenamiento documentados. Cualquier dato sobre el modelo subyacente (parametros, contexto, cuantizacion efectiva, licencia) queda marcado como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no publica pesos; referencia modelos abliterated de terceros sin identificarlos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (lane daily) y Q2 (lane flagship) segun models.lock; no se detallan formatos ni herramientas de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos residen en repos publicos de Hugging Face de terceros; el repo solo contiene scripts y presets) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF/DPO) del modelo subyacente. El repositorio no entrena ni publica pesos: su funcion es orquestar la carga de modelos abliterated de terceros en GPUs alquiladas. La unica innovacion tecnica documentada es de infraestructura: busqueda de instancias en vast.ai por criterios en tiempo de aprovisionamiento (nunca IDs fijos), carga de pesos desde repos publicos de Hugging Face para que el almacenamiento en reposo cueste 0 dolares, y destruccion de la instancia al terminar la sesion para facturar solo horas de GPU.

La model card describe dos lanes: una "daily" con 1 GPU de al menos 24 GB (clase CMP 170HX) y arranque en frio de 5-10 minutos, y una "flagship" con al menos 190 GB totales y red de 2 Gbps o mas (8x V100 o 4x 170HX), con arranque de 10-25 minutos. La seleccion de instancias se realiza mediante criterios codificados en gpu_on.sh. No se documentan tecnicas de atencion, decodificacion especulativa ni optimizaciones de inferencia mas alla del endpoint de Ollama mencionado en el preset local.

## Capacidades

- Generacion de texto y codigo: el stack esta orientado a codigo general y escritura, segun la model card.
- Auditoria de Solidity/EVM y pruebas de concepto de exploits: dominio declarado del proyecto.
- Primitivas DeFi, forense on-chain y MEV: casos de uso explicitamente mencionados.
- Ausencia de rechazos: los pesos abliterated eliminarian las negativas por categoria, segun el autor; no se aporta evidencia ni evaluacion independiente.
- Integracion con Hermes: control mediante comandos de chat ("nyalain gpu lab", "nyalain flagship", "matiin gpu", "status gpu").
- Tool calling, function calling, agentes multi-paso, vision, audio y modo thinking: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Auditoria de contratos Solidity: el stack se aprovisiona bajo demanda para revisar contratos y generar informes de vulnerabilidades, con la ventaja de que la GPU solo se factura durante la sesion y los pesos no generan coste en reposo.
- Pruebas de concepto de exploits: el autor declara que la lane no aplica rechazos en esta categoria, lo que permite generar PoCs de forma directa; requiere un entorno aislado y revision legal antes de cualquier uso.
- Analisis forense on-chain: sesiones puntuales de analisis de transacciones y flujos de fondos con contexto de codigo, aprovisionando la GPU flagship solo cuando se necesita capacidad agregada.
- Investigacion de MEV: experimentacion con estrategias y simulaciones en una lane efimera, destruida al finalizar para controlar el coste.
- Desarrollo de primitivas DeFi: generacion y revision de codigo de contratos y scripts de integracion en sesiones cortas de la lane daily.
- Laboratorio de experimentacion con modelos abliterated: comparar comportamiento con y sin mecanismos de rechazo en un entorno controlado, con pesos descargados de repos publicos.
- Automatizacion de infraestructura GPU: el patron de busqueda por criterios, arranque, carga y destruccion puede reutilizarse para otros flujos que necesiten GPUs efimeras con coste por hora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- Lane daily: 1 GPU con al menos 24 GB de VRAM (clase CMP 170HX), con modelo abliterated en cuantizacion Q4; arranque en frio estimado de 5-10 minutos.
- Lane flagship: capacidad agregada de al menos 190 GB (8x V100 o 4x 170HX) y red de 2 Gbps o superior; modelos en Q2 (referencias "DeepSeek-1017" y "GLM-5.3" no verificables); arranque en frio de 10-25 minutos.
- GPU consumer: el autor no documenta compatibilidad con GPUs de consumo; la lane daily exige al menos 24 GB, umbral que cumplen tarjetas como RTX 3090, 4090 o A6000, pero no se confirma su uso.
- Despliegue: endpoint de Ollama para la lane local segun el preset model.local.yaml; el resto de lanes se cargan en instancias vast.ai. No se mencionan vLLM, llama.cpp ni TGI.
- Coste declarado: aproximadamente 0,25-1,0 USD por hora de GPU segun la lane; almacenamiento en reposo a 0 USD porque los pesos viven en repos publicos de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo propio con parametros, contexto o licencia verificables, por lo que no puede compararse con alternativas de la misma categoria (por ejemplo, modelos abliterated publicados directamente en Hugging Face con pesos y model card completos). La comparacion relevante seria entre el patron de infraestructura propuesto y otras soluciones de inferencia efimera en cloud, pero la informacion disponible no permite una tabla de metricas.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni una model card tecnica: no es posible verificar parametros, contexto, licencia ni idiomas del modelo subyacente.
- Las referencias a "DeepSeek-1017 Q2" y "GLM-5.3 Q2" no son identificadores verificables; no se enlazan repos de Hugging Face concretos en la informacion disponible.
- La ausencia de rechazos (abliterated) no esta evaluada de forma independiente; puede degradar la calidad en tareas generales y aumentar el riesgo de contenido danino.
- El enfoque en generacion de exploits y PoCs conlleva riesgos legales y de seguridad; requiere aislamiento, revision y cumplimiento normativo antes de cualquier uso real.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es posible; ademas, la licencia efectiva depende de los modelos de terceros que se carguen.
- Riesgo de alucinacion: no cuantificado ni documentado por el autor.
- Sesgos conocidos: no disponible.
- Dependencia de la disponibilidad y el precio de instancias en vast.ai; la seleccion por criterios en tiempo de aprovisionamiento puede fallar si no hay oferta compatible.
- El repositorio registra 0 descargas y 0 likes, sin senales de uso o validacion por parte de la comunidad.
- El autor advierte de que las claves deben permanecer en lab.env local y nunca commitearse; el manejo de claves es responsabilidad del usuario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/syahrulrdhn/zero-refusal-stack
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios de codigo o demos.
