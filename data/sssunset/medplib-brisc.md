# Sssunset/MedPLIB-BRISC

## Resumen
MedPLIB-BRISC es un conjunto de pesos adaptados (no un modelo completo) publicado por el usuario de Hugging Face Sssunset, identificado en la model card como el grupo GP8001 Group 3 de la Nanyang Technological University (Simon Tong Sing Hee, Zeng Yi, Feng Peilin, Ye Xiaomeng, Lyu Muyang y Timothy Aw Bang Hao). Se entrena sobre MedPLIB-7b-2e, un modelo de lenguaje multimodal biomedico compuesto por un LLM tipo Llama-7B con arquitectura MoE de 2 expertos, un codificador visual CLIP ViT-L/336 y un decodificador de mascaras SAM-Med2D-B. El objetivo es resolver de forma conjunta clasificacion y segmentacion de tumores cerebrales en resonancia magnetica: dada una rodaja (slice) 2D y una instruccion fija, el modelo devuelve una de cuatro clases (glioma, meningioma, tumor hipofisario o no tumoral) y un token `<SEG>` cuyo estado oculto se decodifica en la mascara del tumor.

La relevancia del trabajo esta en que la clase y la mascara proceden de la misma respuesta generada, de modo que ambos resultados son coherentes por construccion. Segun los datos de la model card, en las 1.000 rodajas de test de BRISC 2025 el modelo alcanza una exactitud de 0,980, un Macro-F1 de 0,982 y un Dice de 0,854 en las 860 rodajas con tumor, sin dibujar ninguna mascara en las 140 rodajas no tumorales y sin ningun caso de desacuerdo entre clase y mascara. Los autores lo presentan explicitamente como un prototipo de investigacion de curso, no como un dispositivo medico.

El repositorio ocupa 0,6 GB y contiene un unico fichero de pesos entrenables de 286,8 millones de parametros (el 2,44 % del sistema segun la model card), con licencia Apache-2.0 para el adaptador. No se publican datos sobre longitud de contexto, cuantizacion ni benchmarks adicionales mas alla de los de BRISC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje multimodal con backbone LLM tipo Llama-7B en configuracion MoE de 2 expertos, encoder visual CLIP ViT-L/336, proyector de imagen, proyector de `<SEG>` y decodificador de mascaras SAM-Med2D-B |
| Parametros totales | 286,8 millones de parametros entrenables en el adaptador (`trainable.pt`); el LLM base es un modelo de aproximadamente 7.000 millones de parametros. La model card indica que esos 286,8 M equivalen al 2,44 % del sistema total; el desglose completo de parametros del sistema no se detalla |
| Parametros activos | No disponible (el modelo base se denomina "7b-2e" por sus 2 expertos, pero no se especifica cuantos parametros se activan por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye un unico fichero PyTorch en la precision del entrenamiento; no hay versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para el adaptador. La licencia de los pesos base (MedPLIB-7b-2e) no se detalla en la informacion disponible |
| Formato de pesos | PyTorch (`.pt`). El fichero `trainable.pt` contiene LoRA sobre el modelo de lenguaje, el proyector de imagen, el router, el proyector de `<SEG>`, el decodificador de mascaras SAM-Med2D y los adaptadores del encoder SAM-Med2D. Se acompanan de `adapter_meta.json` con la configuracion de LoRA y la lista de tensores entrenados |
| Modelo base | Huangxs/MedPLIB-7b-2e |
| Tarea declarada | `image-segmentation` (segmentacion y clasificacion conjuntas) |
| Fecha de publicacion | 8 de octubre de 2026 (segun metadatos de Hugging Face) |
| Descargas / me gusta | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento
El sistema combina tres componentes: un LLM multimodal tipo Llama-7B con mezcla de expertos (2 expertos) que actua como razonador y generador de texto, un encoder visual CLIP ViT-L/336 que procesa la rodaja de resonancia magnetica, y SAM-Med2D-B, cuyo decodificador de mascaras se reutiliza para convertir el estado oculto del token `<SEG>` en una mascara de segmentacion. El entrenamiento se realizo en dos etapas sobre las 5.000 rodajas del split oficial de entrenamiento de BRISC 2025, con 8 GPU NVIDIA A100. La etapa A (alineamiento, 1 epoch) entrena el proyector de imagen, el router, el proyector de `<SEG>` y el decodificador de mascaras, con 43,1 millones de parametros (0,37 %) y una perdida de entropia cruzada mas 2 BCE mas 0,5 Dice. La etapa B (adaptacion, 12 epochs) anade LoRA de rango 16 sobre la atencion y sobre ambos expertos en las 32 capas, ademas de adaptadores en el encoder SAM-Med2D, alcanzando 286,8 millones de parametros entrenables (2,44 %) y una perdida de entropia cruzada mas 2 BCE mas 2 Dice mas IoU.

La composicion de las instrucciones de entrenamiento es mixta: la mitad piden clase y mascara, una cuarta parte solo la clase y otra cuarta parte solo la mascara, con mascara vacia para las rodajas no tumorales. En inferencia se puntua cada una de las cuatro respuestas validas por su log-verosimilitud y se conserva la mejor; la mascara se obtiene del estado del token `<SEG>` de esa respuesta, sin ninguna regla posterior que la elimine. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset mas alla de BRISC 2025 ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Clasificacion de rodajas 2D de resonancia magnetica cerebral en cuatro categorias: glioma, meningioma, tumor hipofisario y no tumoral.
- Segmentacion de tumores: genera la mascara a partir del estado oculto del token `<SEG>` y la hace coherente con la clase predicha.
- Respuesta multimodal conjunta: clase y mascara proceden de la misma respuesta generada, lo que elimina el desacuerdo entre ambas salidas (0 casos sobre 1.000 rodajas de test).
- Manejo explicito del caso no tumoral: no dibuja mascara en ninguna de las 140 rodajas sin tumor del conjunto de test.
- Inferencia con seleccion por log-verosimilitud entre las cuatro respuestas validas.
- Adaptacion eficiente mediante LoRA de rango 16 sobre atencion y expertos, reutilizable como ejemplo de fine-tuning de un VLM medico.
- Capacidad multilingue: limitada al ingles segun los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, uso agentico, vision general fuera del dominio de resonancia magnetica cerebral, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso
- Investigacion en clasificacion y segmentacion conjuntas: sirve como referencia reproducible sobre el split oficial de BRISC 2025, con resultados de una unica ejecucion con semilla 42 (exactitud 0,980, Macro-F1 0,982, Dice 0,854 en rodajas con tumor).
- Preetiquetado asistido para anotacion: el modelo puede generar una primera clase y una primera mascara sobre rodajas nuevas para que un radiologo las revise y corrija, reduciendo el tiempo de anotacion en datasets de tumores cerebrales.
- Estudio de la coherencia entre tareas: al derivar clase y mascara de la misma respuesta, es util para analizar por que los pipelines desacoplados (por ejemplo, un clasificador mas un U-Net independiente) producen contradicciones, que en el experimento de los autores alcanzan el 9,0 % de las rodajas.
- Filtrado de falsos positivos en segmentacion: el modelo puede emplearse para estudiar estrategias que eviten dibujar mascaras en rodajas no tumorales, un fallo que los autores observan en el 61,4 % de las rodajas no tumorales con EfficientNet-B0 y U-Net entrenados por separado.
- Docencia y practicas de posgrado: el repositorio de codigo (`Peilin-FF/Tumor`) incluye scripts de instalacion, descarga de modelos, demo interactiva y reproduccion de resultados, lo que lo hace util como material didactico para adaptar VLMs medicos con LoRA.
- Evaluacion comparativa de pipelines multimodales: sirve como punto de comparacion frente a enfoques puramente de segmentacion (U-Net) o puramente de clasificacion (EfficientNet-B0) en el mismo dataset y particion.
- Prototipado de demostradores con Gradio: el repositorio ofrece `medplib_bt.demo_app` con un puerto configurable, util para construir demos internas de investigacion (nunca para uso clinico).

## Benchmarks y rendimiento
Resultados publicados en la model card sobre las 1.000 rodajas de test de BRISC 2025, de una unica ejecucion de entrenamiento con semilla 42:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,980 |
| Macro-F1 | 0,982 |
| Dice en las 860 rodajas con tumor | 0,854 |
| Dice en las 1.000 rodajas | 0,874 |
| Mascaras dibujadas en las 140 rodajas no tumorales | 0 |
| Rodajas en las que clase y mascara discrepan | 0 |

Comparacion con las lineas base descritas por los autores:

| Sistema | Mascaras en rodajas no tumorales | Contradicciones entre modelos |
|---|---|---|
| MedPLIB-BRISC (clasificacion + segmentacion) | 0 % | No disponible |
| EfficientNet-B0 + U-Net entrenados por separado | 61,4 % | 9,0 % de todas las rodajas |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- Entrenamiento: 8 GPU NVIDIA A100, segun la model card.
- Inferencia: no se publican requisitos oficiales de VRAM. Como estimacion no confirmada por los autores, un LLM de aproximadamente 7.000 millones de parametros en bf16 ocupa del orden de 14 GB de pesos, a los que hay que sumar el encoder CLIP ViT-L/336 y SAM-Med2D-B, mas la cache KV y las activaciones; en la practica se puede esperar una necesidad en el rango de 20-30 GB en bf16 sin cuantizar.
- GPU recomendadas: A100 (40/80 GB) o H100 para reproducir el pipeline completo con margen; RTX 4090 o RTX 3090 (24 GB) como opcion de gama de consumo mas ajustada.
- Cabe en GPU de consumo: probablemente si con 24 GB en bf16 si se ajusta el tamano de lote, aunque no hay confirmacion oficial; en 4 bits cabria en GPUs de 12-16 GB, pero no existen pesos cuantizados publicados.
- Opciones de despliegue: no hay soporte directo para vLLM, TGI, llama.cpp u Ollama, porque los pesos son un adaptador parcial que depende del checkpoint MedPLIB-7b-2e, de CLIP ViT-L/336 y de SAM-Med2D-B, y del codigo del repositorio `Peilin-FF/Tumor`. El despliegue previsto es mediante `scripts/setup_env.sh`, `scripts/download_models.sh`, `scripts/run_infer.sh` y `python -m medplib_bt.demo_app`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Rendimiento en test de BRISC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MedPLIB-BRISC | 286,8 M entrenables sobre MedPLIB-7b-2e (~7 B en el LLM base) | No disponible | Clasificacion y segmentacion conjuntas de tumores cerebrales en MRI 2D | Exactitud 0,980; Macro-F1 0,982; Dice 0,854 (tumor) | Apache-2.0 (adaptador) | Adaptador en Hugging Face mas codigo en GitHub |
| MedPLIB-7b-2e (modelo base) | LLM de ~7 B con MoE de 2 expertos + CLIP ViT-L/336 + SAM-Med2D-B | No disponible | VLM biomedico con comprension a nivel de pixel | No se publican resultados especificos en BRISC en la informacion disponible | No disponible | Hugging Face |
| EfficientNet-B0 y U-Net entrenados por el equipo | No disponible | No disponible | Clasificacion y segmentacion por separado | Dibujan mascara en el 61,4 % de las rodajas no tumorales y se contradicen en el 9,0 % de todas las rodajas | No disponible | No disponible |
| SAM-Med2D-B | No disponible | No disponible | Segmentacion medica (componente del pipeline) | No disponible de forma aislada | No disponible | Usado como componente del sistema |

## Limitaciones y advertencias
- El modelo se entrena y evalua con rodajas 2D de un unico dataset publico. El dataset no incluye identificadores de paciente, por lo que rodajas del mismo paciente pueden aparecer tanto en entrenamiento como en test; los resultados pueden estar sobreestimados por esta fuga potencial.
- Un U-Net dedicado sigue delineando mejor los tumores de media. Los gliomas y las lesiones pequenas son los casos mas debiles.
- Las respuestas en texto libre se volvieron muy cortas tras la adaptacion, lo que limita su utilidad como modelo conversacional.
- Es un prototipo de investigacion de curso, no un dispositivo medico, y no debe usarse para diagnostico ni para tomar decisiones de tratamiento.
- Especializado exclusivamente en resonancia magnetica cerebral 2D; no cubre otras modalidades, otras regiones anatomicas ni volumenes 3D.
- Solo soporta ingles segun los metadatos del repositorio.
- Riesgo de alucinacion en la descripcion textual de hallazgos: no se publican evaluaciones de robustez frente a entradas fuera de distribucion ni estudios de calibracion de la confianza.
- Sesgos conocidos: no se documentan analisis de sesgo por edad, sexo, etnia, tipo de escaner o procedencia de los datos.
- Restricciones de licencia: el adaptador es Apache-2.0, pero la licencia del modelo base MedPLIB-7b-2e no se especifica en la informacion disponible; conviene verificarla antes de cualquier uso mas alla de la investigacion.
- Los pesos no constituyen un modelo autonomo: requieren MedPLIB-7b-2e, CLIP ViT-L/336, SAM-Med2D-B y el codigo del repositorio, lo que complica la reproducibilidad y el despliegue en produccion.
- Rendimiento acreditado con una unica ejecucion de entrenamiento (semilla 42); no se reportan intervalos de confianza ni multiples semillas.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Sssunset/MedPLIB-BRISC
- Pagina de proyecto (Space): https://huggingface.co/spaces/Sssunset/MedPLIB-BRISC
- Codigo en GitHub: https://github.com/Peilin-FF/Tumor
- Modelo base: https://huggingface.co/Huangxs/MedPLIB-7b-2e
- Repositorio oficial de MedPLIB: https://github.com/ShawnHuang497/MedPLIB
- Paper de MedPLIB: https://arxiv.org/abs/2412.09278
- Paper de SAM-Med2D: https://arxiv.org/abs/2308.16184
- Dataset BRISC 2025: https://www.nature.com/articles/s41597-026-06753-y
