# tstepspam/Cydonia-24B-v4.3-Q8-MLX

## Resumen

Cydonia-24B-v4.3-Q8-MLX es una cuantizacion en 8 bits del modelo TheDrummer/Cydonia-24B-v4.3, publicada por el usuario tstepspam y empaquetada en formato MLX para su ejecucion en Apple Silicon. Se trata de un modelo denso de generacion de texto con 23.572.403.200 parametros (aproximadamente 23,57 mil millones) y etiquetado como perteneciente a la familia Mistral, lo que situa su arquitectura en la estirpe de los transformers decoder-only con atencion agrupada. El repositorio ocupa 25,1 GB y contiene pesos en safetensors cuantizados a 8 bits.

El modelo resuelve un problema muy concreto: permitir que los pesos completos de Cydonia-24B v4.3 (una variante afinada para conversacion, sin censura reforzada y con estilo narrativo) se ejecuten en equipos con memoria unificada de Apple, donde hasta ahora solo era practico recurrir a cuantizaciones Q4. Al ser una cuantizacion Q8, conserva mas fidelidad respecto al modelo original que las versiones de 4 bits, a cambio de un mayor consumo de memoria unificada.

Su relevancia actual es limitada y muy de nicho: el repositorio no registra descargas ni interacciones, no declara licencia ni idiomas, y su unico publico objetivo son usuarios de MLX en macOS. Quien busque el modelo para GPU NVIDIA o despliegue en servidor encontrara alternativas mas adecuadas en formato GGUF o en pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiqueta "mistral" en el repositorio; detalles no disponibles) |
| Parametros totales | 23.572.403.200 (23,57 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (Q8) en formato MLX |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato y libreria MLX) |
| Tamano del repositorio | 25,1 GB |
| Modelo base | TheDrummer/Cydonia-24B-v4.3 |
| Libreria de inferencia | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento en la informacion proporcionada. El unico dato tecnico verificable es que se trata de una cuantizacion: los pesos originales del modelo TheDrummer/Cydonia-24B-v4.3 se han convertido a 8 bits para su uso con la libreria MLX de Apple. La etiqueta "mistral" indica que la arquitectura subyacente pertenece a la familia Mistral, aunque no se especifica la version exacta ni el tamano de contexto nativo.

Tampoco hay datos publicos en este repositorio sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por fases de RLHF o DPO. Las variantes derivadas documentadas en la busqueda web (por ejemplo, la version "heretic" abliterada) sugieren que Cydonia es un fine-tune orientado a eliminar restricciones de rechazo, pero esa informacion corresponde a otros repositorios y no a esta cuantizacion concreta.

## Capacidades

- Generacion de texto en modo conversacional, segun la etiqueta `conversational` del repositorio.
- Generacion de texto general (`text-generation`) como tarea declarada en el pipeline.
- Capacidad de ejecucion local en Apple Silicon gracias al formato MLX.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Generacion de codigo, matematicas o razonamiento formal: no disponible en la informacion del repositorio.

## Casos de uso

- Prototipado local en macOS: desarrolladores con un Mac de memoria unificada amplia pueden cargar la cuantizacion Q8 con `mlx-lm` para experimentar con un modelo de 23,57 B sin depender de servicios en la nube. Es adecuado porque MLX esta optimizado para el motor unificado de Apple.
- Evaluacion comparativa de cuantizaciones: permite medir la perdida de calidad entre una Q8 y las versiones Q4 del mismo modelo base, util para decidir que formato desplegar en produccion.
- Generacion de texto creativo y narrativa: al derivar de Cydonia v4.3, cuyas variantes estan orientadas a escritura sin filtros excesivos, encaja en tareas de redaccion literaria o generacion de dialogos donde se busca un tono menos encorsetado.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local, permite procesar texto sensible sin enviarlo a APIs externas, siempre que el equipo disponga de memoria suficiente.
- Investigacion sobre alineacion y comportamiento: un modelo de esta clase, con sus variantes abliteradas asociadas, sirve para estudiar como responden los modelos de 24 B ante prompts que los modelos alojados suelen rechazar.
- Generacion de corpus para pruebas de seguridad: combinado con las variantes "heretic" documentadas, el mismo flujo de trabajo en MLX permite producir textos de entrenamiento o evaluacion para equipos de red team.
- Desarrollo de asistentes conversacionales de escritorio: integrable en aplicaciones nativas de macOS mediante la libreria MLX, con conversaciones multi-turno siempre que el contexto lo permita (longitud no declarada).
- Fine-tuning posterior o experimentacion con adaptadores: al estar en safetensors, los pesos pueden servir de punto de partida para tecnicas de ajuste ligero en el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos en Q8 ocupan aproximadamente 25 GB, por lo que se recomienda un minimo de 32 GB de memoria unificada para dejar margen a la cache KV y al resto del sistema.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No es un formato nativo para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: en el caso de NVIDIA, una RTX 4090 con 24 GB se queda justa o directamente no cabe, ya que los pesos solos rondan los 25 GB. En Apple Silicon, un Mac con 32 GB de memoria unificada es el umbral practico; 64 GB o mas ofrece una experiencia holgada.
- Opciones de despliegue: `mlx-lm` como ruta principal; tambien herramientas de escritorio para macOS basadas en MLX. vLLM y TGI no soportan el formato MLX de forma nativa. La variante GGUF del modelo base (7,88 GB en Q4) es la via recomendada para llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles. Dependen por completo del chip Apple, del ancho de banda de memoria unificado y de la longitud de contexto utilizada, que ademas no esta documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/Cydonia-24B-v4.3-Q8-MLX | 23,57 B | MLX, 8 bits, 25,1 GB | no disponible | no disponible | HuggingFace, 0 descargas |
| TheDrummer/Cydonia-24B-v4.3 | 23,57 B (presumiblemente igual) | pesos completos | no disponible | no disponible | HuggingFace (modelo base) |
| Cydonia-24B-v4.3 GGUF (local-ai-zone) | 23,57 B | GGUF, 7,88 GB | no disponible | no disponible | 101.282 descargas, 94 likes |
| tstepspam/Cydonia-24B-v4.3-heretic-v4-Q4-MLX | 23,57 B (presumiblemente igual) | MLX, 4 bits | no disponible | no disponible | HuggingFace (variante abliterada) |

La comparacion directa con modelos de otros autores (por ejemplo, la familia Mistral Small de 24 B) no puede establecerse con rigor porque no se declaran ni licencia, ni contexto, ni resultados de evaluacion en este repositorio.

## Limitaciones y advertencias

- El repositorio no declara licencia. Sin ese dato, el uso comercial queda en un limbo legal y conviene consultar la licencia del modelo base TheDrummer/Cydonia-24B-v4.3 antes de cualquier despliegue productivo.
- No se declaran los idiomas soportados. El rendimiento fuera del ingles (y potencialmente de otros idiomas mayoritarios) es una incognita.
- No se declara la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Al ser una cuantizacion a 8 bits, existe una degradacion de calidad respecto a los pesos completos, aunque menor que en cuantizaciones de 4 bits. No se documentan mediciones de esa perdida.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas que lo cuantifiquen para esta cuantizacion concreta.
- Sesgos conocidos: no documentados en el repositorio. Al derivar de un fine-tune sin filtros reforzados, es esperable una menor tasa de rechazo ante peticiones delicadas, lo que puede producir contenido inapropiado.
- Sin soporte en el ecosistema de servidores de inferencia habitual (vLLM, TGI). El formato MLX limita el despliegue a hardware Apple.
- Repositorio sin traccion: cero descargas y cero interacciones, sin garantia de mantenimiento, actualizacion ni soporte por parte del autor.
- La fecha de creacion indicada (2026-10-16) es posterior a la fecha actual de referencia, lo que sugiere un posible error en los metadatos o un repositorio de caracter experimental.
- Advertencia de seguridad: las variantes abliteradas asociadas a esta familia estan pensadas, segun la documentacion externa, para generar respuestas ante prompts de seguridad ofensiva. Ese material debe manejarse en entornos controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tstepspam/Cydonia-24B-v4.3-Q8-MLX
- Modelo base: https://huggingface.co/TheDrummer/Cydonia-24B-v4.3
- Variante heretic en MLX Q4 del mismo autor: https://huggingface.co/tstepspam/Cydonia-24B-v4.3-heretic-v4-Q4-MLX
- Ficha del modelo GGUF en local-ai-zone: https://local-ai-zone.github.io/models/cydonia-24b-v4-3.html
- Catalogo de InferX para Cydonia-24B-v4.3: https://model.inferx.net/catalog/thedrummer--cydonia-24b-v4.3
- Ficha del modelo abliterado Cydonia-24B-v4.3-heretic: https://www.abliteratedmodels.org/cydonia-24b-v4.3-heretic/
