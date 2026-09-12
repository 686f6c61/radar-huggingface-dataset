# UniverseTBD/astrobridge-model-v7

## Resumen

AstroBridge Captioner (UniverseTBD/astrobridge-model-v7) es un adaptador LoRA con una pila de fusión multimodal asociada, entrenado sobre el modelo base congelado Qwen/Qwen3.5-9B, para generar descripciones en lenguaje natural de datos astronomicos. El modelo no es un LLM autonomo: el repositorio no incluye los pesos del modelo base, sino el adaptador (0,3 GB en total) y un fichero `middle.pt` con la pila de fusión compuesta por proyectores, una capa de identidad de modalidad, un Q-Former y el adaptador. El autor lo describe como un "n-modality (image + spectra) astronomy captioner", aunque la evaluacion publicada cubre tres modalidades: imagen, espectro y curva de luz.

Su relevancia es acotada pero clara: el captioning multimodal en astronomia es un problema especializado donde los modelos genericos de vision-lenguaje fallan al interpretar magnitudes, bandas fotometricas, rasgos de absorcion (Ca II H & K, G-band, Mg I b, Na I D) o morfologias extensas. AstroBridge aborda esto con un esquema de entrenamiento en dos niveles ("single" y "joint", con 4.120 y 1.318 muestras respectivamente) y con una bateria de evaluacion orientada a la "groundedness" (pruebas de barajado, ablacion de modalidad y diversidad) en lugar de benchmarks genericos.

El proyecto esta en una fase muy temprana: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin pipeline asignado en HuggingFace. Cualquier uso en produccion exige verificar primero la licencia del modelo base y del propio adaptador, y reconstruir manualmente el codigo de carga de la pila de fusión a partir del paquete `captioner` referenciado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen/Qwen3.5-9B) mas pila de fusion multimodal con proyectores, capa de identidad de modalidad y Q-Former |
| Parametros totales | 9B en el modelo base (no incluido en el repositorio); parametros del adaptador y de la pila de fusion: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ninguna aplicada durante el entrenamiento (`quantization: None`); cuantizaciones posteriores no documentadas |
| Idiomas soportados | no disponible (las descripciones de ejemplo de la evaluacion estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) y `middle.pt` (checkpoint PyTorch de la pila de fusion) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen3.5-9B (congelado, debe cargarse por separado) |
| Modalidades de entrada | Imagen, espectro y curva de luz (segun la evaluacion publicada) |
| Modalidad de salida | Texto (captioning) |
| config_hash | cde984a5c692e8cd |
| git_sha | a5fa267401ffe7e85cb2c0870f8bc3a642acc18e |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, un LLM decoder-only de 9B parametros congelado (Qwen/Qwen3.5-9B), que aporta el modelado de lenguaje y el conocimiento general. Por otro, una pila de fusión entrenada especificamente para este proyecto que, segun la model card, contiene proyectores de modalidad, una capa de identidad de modalidad, un Q-Former y el adaptador LoRA. La clase `FusionStack` del paquete `captioner` (ficheros `captioner/model/captioner.py` y `captioner/train/stage1.py`, funcion `run_stage1`) es la encargada de construir y cablear esa pila con el LLM; el repositorio no incluye ese codigo, por lo que la reproducibilidad depende de disponer del paquete mencionado.

El entrenamiento se organizo en dos niveles de dificultad, con un histograma de 4.120 muestras de tipo `single` y 1.318 de tipo `joint`. No se documentan el numero total de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se aplico cuantizacion durante el entrenamiento. La innovacion tecnica mas destacable no esta en la arquitectura en si, sino en el protocolo de evaluacion: en lugar de benchmarks genericos, el autor publica una "groundedness gate" con tres pruebas por modalidad (barajado de la entrada, ablacion de la modalidad y diversidad de captions) y un campo `null_result` que indica si el modelo supera o no cada prueba.

## Capacidades

- Generacion de descripciones textuales de imagenes astronomicas, incluyendo morfologia, orientacion y estructura del objeto (por ejemplo, distribuciones ovaladas elongadas con nucleo calido y brillante).
- Descripcion de espectros opticos: identificacion de continuo estelar y de rasgos de absorcion concretos (Ca II H & K, G-band, Mg I b, Na I D).
- Descripcion de curvas de luz opticas: bandas, duracion del muestreo, dia de maximo y magnitudes con su incertidumbre (por ejemplo, maximo en banda g en el dia 13,0 con 17,09 ± 0,04 mag).
- Manejo de multiples modalidades en una misma arquitectura (imagen, espectro y curva de luz), con una capa explicita de identidad de modalidad en la pila de fusion.
- Condicionamiento real sobre la entrada: las pruebas de barajado y ablacion indican que el caption cambia cuando se altera o elimina la modalidad de entrada.
- Diversidad de salida alta: fracciones de captions distintos de 0,9917 (imagen), 1,0 (espectro) y 1,0 (curva de luz) en las pruebas de diversidad.
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta especializado en una unica tarea generativa.
- Capacidades multilingues: no documentadas; los ejemplos publicados estan en ingles.
- Modo "thinking", vision general, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Catalogacion automatica de imagenes de sondeos astronomicos: el modelo genera descripciones textuales de morfologia y estructura del objeto directamente desde el recorte de imagen, lo que permite indexar y buscar en catalogos por lenguaje natural sin anotacion manual previa.
- Preanotacion de espectros para pipelines de clasificacion: el adaptador identifica continuo y rasgos de absorcion, de modo que un equipo puede usar sus captions como borrador revisable antes de la inspeccion experta.
- Etiquetado asistido de curvas de luz en estudios de transitos o supernovas: la descripcion incluye bandas, cadencia y parametros del maximo, lo que facilita el triaje rapido de objetos con muestreo irregular.
- Generacion de texto divulgativo a partir de datos de observatorio: dado que produce descripciones en lenguaje natural con terminologia tecnica, sirve como primer borrador para notas de prensa o fichas de objeto, siempre con revision humana.
- Control de calidad y deteccion de entradas anomalas: las pruebas de barajado y ablacion del propio autor indican que el modelo responde a la modalidad de entrada; ese comportamiento puede usarse como senal para detectar recortes mal alineados o espectros corruptos cuya descripcion no cambia al modificar la entrada.
- Enriquecimiento de bases de datos astronomicas con campos de texto: los captions pueden almacenarse junto al objeto para habilitar busqueda semantica y agrupamiento por caracteristicas descritas (por ejemplo, "nucleo brillante", "absorcion intensa en Na I D").
- Investigacion sobre fusión multimodal: al ser una pila LoRA mas Q-Former sobre un LLM congelado, sirve como banco de pruebas reproducible para estudiar transferencia entre modalidades cientificas con coste de entrenamiento reducido.
- Integracion en un pipeline de reduccion de datos: al cargarse con `transformers` y `peft` sobre el modelo base, puede invocarse como paso posterior a la extraccion de imagenes, espectros o fotometria dentro de un flujo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica unicamente la evaluacion de "groundedness gate", con pruebas de barajado (`shuffle_test`), ablacion (`ablation_test`) y diversidad (`diversity_test`) por modalidad:

| Prueba | Modalidad | n | Metrica | Valor | null_result |
|---|---|---|---|---|---|
| shuffle_test | imagen | 58 | distancia de edicion media | 240,05 | false |
| ablation_test | imagen | 109 | fraccion de captions que cambian | 1,0 | false |
| diversity_test | imagen | 120 | distinct_fraction | 0,9917 | false |
| diversity_test | imagen | 120 | top1_share | 0,0167 | false |
| shuffle_test | espectro | 13 | distancia de edicion media | 196,77 | false |
| ablation_test | espectro | 43 | fraccion de captions que cambian | 1,0 | false |
| diversity_test | espectro | 114 | distinct_fraction | 1,0 | false |
| diversity_test | espectro | 114 | top1_share | 0,0088 | false |
| shuffle_test | curva de luz | 9 | distancia de edicion media | 52,67 | false |
| ablation_test | curva de luz | 48 | fraccion de captions que cambian | 1,0 | false |
| diversity_test | curva de luz | 94 | distinct_fraction | 1,0 | false |
| diversity_test | curva de luz | 94 | top1_share | 0,0106 | false |

Todas las pruebas se marcan como no nulas, es decir, el modelo supera el criterio de groundedness definido por el autor. Los tamanos de muestra son pequenos (entre 9 y 120 ejemplos segun la prueba), por lo que la significacion estadistica es limitada. No hay comparacion con otros sistemas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el modelo base de 9B en bfloat16 ocupa aproximadamente 18 GB solo en pesos, mas overhead de activaciones y cache KV; el adaptador LoRA y la pila de fusion anaden una cantidad no cuantificada. Estas cifras son estimaciones, no datos publicados por el autor.
- GPU recomendadas: no documentadas. Por tamano del modelo base, un despliegue en bfloat16 requeriria GPU de clase A100 40 GB, H100 o L40S; no hay confirmacion por parte del autor.
- GPU de consumo: no confirmado. Una cuantizacion a 4 bits del modelo base situaria los pesos en torno a 5-6 GB, lo que en teoria cabria en una RTX 4090, RTX 3090 o similar, pero el autor no documenta cuantizaciones ni pruebas en hardware de consumo.
- Opciones de despliegue: la unica via documentada es `transformers` + `peft` (`AutoModelForCausalLM.from_pretrained("Qwen/Qwen3.5-9B")` seguido de `PeftModel.from_pretrained`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y en particular no existe version GGUF publicada.
- Requisito adicional: la pila de fusion (`middle.pt`) necesita la clase `FusionStack` del paquete `captioner` para cargarse; sin ese codigo el adaptador no es funcional por si solo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables en la informacion proporcionada, ni de resultados de benchmarks que permitan una comparacion cuantitativa. La unica referencia contrastable es el propio modelo base:

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AstroBridge Captioner (v7) | 9B (base) + adaptador y pila de fusion no cuantificados | no disponible | imagen, espectro, curva de luz | no disponible | publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible | no disponible en la informacion proporcionada | publico en HuggingFace |
| Otros captioners astronomicos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo base: hay que descargar Qwen/Qwen3.5-9B por separado y aplicar el adaptador encima.
- La pila de fusion requiere la clase `FusionStack` del paquete `captioner`, que no forma parte del repositorio. Sin ese codigo, `middle.pt` no es cargable y el modelo no funciona.
- Licencia no disponible. No se puede asumir uso comercial sin verificar previamente los terminos del adaptador y los del modelo base.
- Idiomas soportados no declarados; los ejemplos publicados estan en ingles, por lo que la calidad en castellano es desconocida.
- Longitud de contexto no documentada, lo que impide planificar casos de uso que requieran ventanas largas.
- Los tamanos de muestra de la evaluacion son muy pequenos (13 ejemplos en el shuffle_test de espectro, 9 en el de curva de luz), lo que limita la robustez de las conclusiones.
- La evaluacion publicada mide groundedness y diversidad, no exactitud cientifica del contenido: un caption diverso y sensible a la entrada puede seguir siendo factualmente incorrecto.
- Riesgo de alucinacion en terminos y mediciones astronomicas (magnitudes, rasgos espectrales, parametros de variabilidad) no cuantificado; se requiere validacion por expertos antes de cualquier uso cientifico.
- Cero descargas y cero likes en HuggingFace, sin pipeline asignado ni historial de uso de la comunidad: el modelo no ha sido validado externamente.
- Sesgos conocidos: no documentados. El desequilibrio del dataset de entrenamiento (4.120 muestras `single` frente a 1.318 `joint`) puede sesgar el comportamiento hacia tareas de una sola modalidad.
- Fechas de creacion y actualizacion del repositorio (2026-09-12) posteriores al momento de redaccion de esta ficha; conviene verificar el estado actual del repositorio.
- No hay versiones cuantizadas publicadas, por lo que el despliegue en hardware modesto exige cuantizar por cuenta propia y asumir el riesgo de degradacion en la pila de fusion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/UniverseTBD/astrobridge-model-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio o demo del proyecto: no disponible en la informacion proporcionada.
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Los unicos resultados obtenidos corresponden a paginas sobre Guillaume Meurice (Wikipedia, sitio oficial, Facebook, Le Monde, Radio Nova) y no guardan relacion con AstroBridge ni con Qwen.
