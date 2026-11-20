# UGREENDEV/RK182X-VLM-UI-TARS-2B-SFT

## Resumen

RK182X-VLM-UI-TARS-2B-SFT es una conversion al formato RKNN del modelo vision-lenguaje ByteDance-Seed/UI-TARS-2B-SFT, publicada por UGREENDEV. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado y cuantizado pensado para ejecutarse sobre la NPU del chip Rockchip RK1828. El modelo base UI-TARS-2B-SFT esta disenado por ByteDance para interaccion con interfaces de usuario: recibe capturas de pantalla y produce acciones o texto, lo que lo situa en la categoria de agentes GUI (GUI agents).

La relevancia de esta ficha es acotada pero concreta: permite desplegar un VLM de 2B parametros en hardware de borde basado en RK1828 con cuantizacion w4a16 y una ventana de contexto de 27648 tokens para el componente de lenguaje. Frente a la version original en safetensors, esta conversion impone restricciones fuertes de plataforma (solo RK1828, runtime RKNN v1.1.0), pero habilita casos de uso embebidos que no requieren GPU dedicada.

La informacion publicada por el autor es escasa: no hay datos de benchmarks, idiomas soportados ni detalles del proceso de entrenamiento mas alla de la referencia al modelo base. Todo lo que sigue se limita a lo que consta en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (vision-lenguaje) derivada de ByteDance-Seed/UI-TARS-2B-SFT; sin detalle arquitectonico en la ficha |
| Parametros totales | 2B (segun nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 27648 tokens (LLM) |
| Tipos de cuantizacion | Vision: w4a16; LLM: w4a16; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); artefactos derivados sujetos a la licencia del modelo fuente y del runtime RKNN |
| Formato de pesos | RKNN (runtime v1.1.0); repo de 1.9 GB |
| Resolucion de vision | 448x448 |
| Nucleos NPU | Vision: 8; LLM: 8 |
| Chips soportados | RK1828 (etiqueta RK182X) |
| Runtime RKNN | v1.1.0 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base ni el proceso de entrenamiento. Se sabe que UI-TARS-2B-SFT es un modelo vision-lenguaje orientado a tareas de interfaz grafica, pero esta ficha no dispone de datos sobre composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO. Cualquier afirmacion al respecto seria especulativa y no se incluye.

Lo que si esta documentado es el pipeline de conversion: los pesos originales se transformaron a formato RKNN v1.1.0 con cuantizacion w4a16 tanto en la torre de vision como en el LLM, con 8 nucleos NPU asignados a cada componente y KVCache en fp16. El repositorio incluye checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue.

## Capacidades

- Entrada image-text-to-text: procesa imagenes (capturas de pantalla a 448x448) junto con instrucciones textuales.
- Generacion de texto y razonamiento sobre contenido visual, heredado del modelo base UI-TARS.
- Interaccion con interfaces de usuario: el modelo base esta orientado a tareas de agente GUI (interpretacion de pantallas y generacion de acciones).
- Contexto de 27648 tokens para el LLM, suficiente para historiales multi-turno o capturas con descripciones extensas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada mas alla del proposito declarado del modelo base.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Automatizacion de pruebas de interfaz en dispositivos embebidos: el modelo puede analizar capturas de pantalla generadas por un dispositivo con RK1828 y describir o clasificar el estado de la UI, aprovechando la NPU local sin depender de la nube.
- Asistencia en kioscos o terminales de autoservicio: al ejecutarse sobre RK1828, permite interpretar la pantalla mostrada al usuario y generar respuestas o sugerencias de siguiente accion en local.
- Procesamiento de documentos escaneados en el borde: con vision a 448x448 y contexto de 27k tokens, puede extraer y resumir contenido de imagenes de documentos en flujos con requisitos de privacidad.
- Accesibilidad en dispositivos de bajo consumo: descripcion de elementos visuales de la pantalla para usuarios con discapacidad visual, ejecutandose en hardware sin GPU dedicada.
- Clasificacion y enrutado de imagenes en pipelines industriales: uso de la torre de vision cuantizada para tareas de etiquetado simple en dispositivos Rockchip desplegados en planta.
- Prototipado de agentes GUI en hardware de borde: validacion de flujos de interaccion (leer pantalla, decidir accion) antes de escalar a un modelo mayor en servidor, con la ventaja de que el artefacto ya esta optimizado para RKNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: chip Rockchip RK1828 con runtime RKNN v1.1.0 y driver correspondiente. Verificar la version en el dispositivo con `rknn-smi -v`.
- VRAM/GPU: no aplica; el modelo se ejecuta en NPU, no en GPU. No se dispone de cifras de memoria del sistema requerida.
- GPU recomendadas: no disponible (no es un artefacto para GPU).
- Compatibilidad con GPU de consumo: no; el formato RKNN no es ejecutable en CUDA ni en llama.cpp/Ollama.
- Opciones de despliegue: runtime RKNN v1.1.0 sobre RK1828; descarga via Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponible en la informacion proporcionada.
- Integridad: ejecutar `sha256sum -c SHA256SUMS` en el directorio de configuracion y desplegar solo si todas las entradas muestran `OK`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| RK182X-VLM-UI-TARS-2B-SFT (este) | 2B | 27648 tokens | RKNN | Apache 2.0 (base) | RK1828 |
| ByteDance-Seed/UI-TARS-2B-SFT | 2B | no disponible en esta ficha | safetensors (original) | Apache 2.0 | GPU/CPU generica |
| Otros VLM de 2B para GUI | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo fuente, ya que no se dispone de datos verificables de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en RK1828 con RKNN Runtime v1.1.0; no es portable a otras NPU, GPU o CPU.
- Artefacto derivado: los pesos han sido convertidos y cuantizados (w4a16), por lo que el comportamiento puede diferir del modelo base original; no son pesos upstream sin modificar.
- Sin datos de evaluacion: no hay benchmarks publicados, lo que impide estimar la perdida de calidad introducida por la cuantizacion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion especifica publicada para este artefacto.
- Sesgos: no documentados en la informacion disponible.
- Licencia: Apache 2.0 para el modelo base, pero los artefactos derivados siguen sujetos a las restricciones del modelo fuente y a las licencias del RKNN Toolkit y RKNN Runtime, cuyas librerias no se incluyen en el paquete.
- Uso en produccion: requiere verificar checksums y versiones de runtime; no se documentan garantias de soporte ni mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-UI-TARS-2B-SFT
- Modelo base: https://huggingface.co/ByteDance-Seed/UI-TARS-2B-SFT
- Documentacion de configuracion (ingles): `UI-TARS-2B-SFT-448x448-w4a16-8-27648/README.md` dentro del repositorio
- Documentacion de configuracion (chino): `UI-TARS-2B-SFT-448x448-w4a16-8-27648/README_CN.md` dentro del repositorio
- ModelScope: busqueda del identificador `UGREENDEV/RK182X-VLM-UI-TARS-2B-SFT`
