# wuzimo/verifai-text-models

## Resumen

`wuzimo/verifai-text-models` es un repositorio agregado que empaqueta dos modelos de texto independientes empleados por el sitio VERIFAI, un proyecto de fin de carrera orientado a la verificacion de texto. No se trata de un modelo unico entrenado desde cero, sino de una coleccion con dos subdirectorios: `ru/` contiene una copia sin modificaciones de `toiletsandpaper/russian-ai-text-detector-modernbert` (un detector de texto generado por IA en ruso, basado en la arquitectura ModernBERT) y `kk/` contiene un ajuste fino de `intfloat/multilingual-e5-small` sobre el dataset AINA-KK para tareas en kazajo.

El interes practico del repositorio es acotado: sirve como artefacto reproducible de un sistema de deteccion y analisis de texto para ruso y kazajo, distribuido en formato ONNX (segun los tags del repositorio) y con un tamano total de aproximadamente 0,6 GB. La licencia es "other", con restricciones explicitas a uso no comercial, lo que limita su adopcion en produccion.

La relevancia actual es limitada pero concreta: los detectores de texto generado por IA en lenguas distintas del ingles son escasos, y el kazajo es un idioma con muy poca cobertura en herramientas de este tipo. El repositorio es util como referencia para quien necesite un detector en ruso o un encoder multilingue ajustado para kazajo, no como un modelo generalista de proposito multiple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos submodelos: `ru/` ModernBERT (detector de texto IA); `kk/` encoder transformer tipo E5-small (XLM-R small) ajustado |
| Parametros totales | no disponible (no se especifica el conteo; `multilingual-e5-small` ronda los 118 M, ModernBERT varia segun variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (ModernBERT soporta hasta 8192 tokens; E5-small, 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (el repo se distribuye en ONNX; no se listan variantes cuantizadas) |
| Idiomas soportados | ruso (`ru`), kazajo (`kk`) |
| Licencia | other (no comercial; `ru/` Apache-2.0, `kk/` solo investigacion y no comercial por herencia de AINA-KK CC BY-NC 4.0) |
| Formato de pesos | ONNX (segun tags del repositorio) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio: agrega dos artefactos preexistentes. El submodelo `ru/` es una copia literal de `toiletsandpaper/russian-ai-text-detector-modernbert`, un clasificador basado en ModernBERT (transformer encoder con atencion alterna local/global y soporte de contexto largo) afinado para distinguir texto humano de texto generado por IA en ruso. El autor declara que se incluye "sin cambios".

El submodelo `kk/` parte de `intfloat/multilingual-e5-small`, un encoder multilingue de la familia E5 (derivado de XLM-R small) disenado para embeddings de frases, y lo ajusta sobre el dataset AINA-KK (CC BY-NC 4.0). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; al tratarse de tareas de clasificacion/embedding, lo habitual seria un ajuste supervisado con pares o etiquetas, pero no se confirma en la informacion disponible. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion linear propia, etc.).

## Capacidades

- Deteccion de texto generado por IA en ruso (submodelo `ru/`, clasificador ModernBERT).
- Generacion de embeddings de frases en kazajo y multilingues (submodelo `kk/`, derivado de E5-small).
- Clasificacion o similitud semantica sobre texto en kazajo tras el ajuste con AINA-KK (la tarea exacta no se detalla en la model card).
- Soporte de inferencia via ONNX Runtime (formato de pesos ONNX).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues limitadas a ruso y kazajo (el encoder base E5 es multilingue, pero el ajuste se orienta a kazajo).

## Casos de uso

- Deteccion de ensayos o trabajos generados por IA en ruso: el submodelo `ru/` puede integrarse en un pipeline de revision academica que puntue la probabilidad de autoria artificial de un texto, aprovechando el contexto largo de ModernBERT para documentos completos.
- Moderacion de contenido en foros en ruso: clasificar publicaciones sospechosas de ser generadas masivamente por bots o modelos de lenguaje.
- Verificacion de originalidad en plataformas editoriales en ruso: complementar detectores de plagio con una senal de generacion sintetica.
- Busqueda semantica en kazajo: usar los embeddings del submodelo `kk/` para indexar y recuperar documentos por similitud vectorial en una base de datos como FAISS o pgvector.
- Clasificacion o filtrado de textos en kazajo en un corpus de investigacion: el ajuste sobre AINA-KK permite tareas supervisadas en ese idioma, con la restriccion de uso no comercial.
- Prototipado de un servicio de analisis de texto bilingue (ru/kk): el empaquetado ONNX facilita el despliegue en entornos sin GPU mediante ONNX Runtime.
- Reproducibilidad de un proyecto academico: sirve como artefacto de referencia para replicar el sistema VERIFAI en un entorno de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tamano del repo (0,6 GB) y las arquitecturas implicadas (ModernBERT y E5-small), la inferencia cabe holgadamente en GPU consumer con 4-8 GB de VRAM, e incluso en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 en adelante) seria suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a estos clasificadores/encoders.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wuzimo/verifai-text-models` | no disponible | no disponible | Deteccion IA (ru) + embeddings (kk) | other (no comercial) | Hugging Face, ONNX |
| `toiletsandpaper/russian-ai-text-detector-modernbert` | no disponible | no disponible | Deteccion de texto IA en ruso | Apache-2.0 | Hugging Face |
| `intfloat/multilingual-e5-small` | ~118 M | 512 tokens | Embeddings multilingues | MIT | Hugging Face |
| Detectores de texto IA en ingles (p. ej. basados en RoBERTa) | ~125 M tipico | 512 tokens | Deteccion de texto IA | variable | Hugging Face |

La comparativa se limita a los componentes de origen, ya que no se dispone de datos de rendimiento del repositorio agregado ni de benchmarks publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: el repositorio se declara "other" y la model card indica uso exclusivamente no comercial; el submodelo `kk/` hereda la restriccion CC BY-NC 4.0 del dataset AINA-KK, por lo que no puede usarse en produccion comercial.
- El submodelo `ru/` se incluye "sin cambios" y conserva su licencia Apache-2.0 original, pero el empaquetado conjunto queda bajo la licencia "other" del repositorio.
- Los detectores de texto generado por IA presentan tasas de falsos positivos y falsos negativos no documentadas aqui; no hay benchmarks publicados que permitan calibrar su fiabilidad.
- Cobertura idiomatica limitada a ruso y kazajo; no es adecuado para otros idiomas sin validacion previa.
- No se documentan sesgos conocidos, pero el ajuste sobre AINA-KK puede heredar sesgos del dataset de origen.
- Riesgo de alucinacion no aplica en sentido estricto (son clasificadores/encoders, no generadores), pero si existe riesgo de clasificaciones erroneas sin calibracion documentada.
- Proyecto de fin de carrera: sin mantenimiento garantizado, sin descargas ni likes, y con documentacion tecnica minima (no se detallan hiperparametros, datos de entrenamiento ni metricas).
- El formato ONNX facilita el despliegue, pero no se documentan variantes cuantizadas ni requisitos de version de ONNX Runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wuzimo/verifai-text-models
- Modelo de origen `ru/`: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-modernbert
- Modelo base `kk/`: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset AINA-KK: https://huggingface.co/datasets/ajnasiou/aina-kk
