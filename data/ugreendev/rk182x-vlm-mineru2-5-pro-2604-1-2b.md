# UGREENDEV/RK182X-VLM-MinerU2.5-Pro-2604-1.2B

## Resumen
RK182X-VLM-MinerU2.5-Pro-2604-1.2B es una conversión a formato RKNN del modelo original OpenDataLab/MinerU2.5-Pro-2604-1.2B, un VLM (vision-language model) de 1.200 millones de parámetros especializado en el parseo de documentos. Lo publica UGREENDEV y está pensado para ejecutarse sobre los SoC con NPU de Rockchip de la familia RK182X (concretamente RK1820 y RK1828), no sobre GPUs convencionales. El modelo resuelve la tarea de reconocimiento de layout, texto, fórmulas y tablas a partir de una única imagen de página.

La conversión incluye dos configuraciones precompiladas con cuantización w4a16 tanto en el encoder visual como en el LLM, ventana de contexto de 8.192 tokens y KVCache en fp16. La resolución de entrada varía según el chip: 1.036x1.036 para RK1828 y 448x448 para RK1820 y RK1828. El runtime RKNN utilizado es la versión v1.1.0.

Es relevante porque acerca un modelo de document parsing de 1,2B a hardware de bajo consumo y coste (NPU embebida), un nicho donde escasean alternativas open source listas para producción. La licencia del modelo fuente es Apache 2.0, aunque el uso queda condicionado también por las licencias del RKNN Toolkit y del RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (encoder visual + LLM) convertido a RKNN; arquitectura interna del modelo fuente no disponible |
| Parametros totales | 1.2B (aprox. 1.200 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (LLM) |
| Tipos de cuantizacion | w4a16 (vision y LLM); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo fuente); aplican ademas las licencias de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); tambien etiquetado como gguf en los tags del repo |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo fuente (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO). Se sabe que es un modelo image-text-to-text de 1,2B parámetros orientado a document parsing, con un componente visual y un componente LLM, ambos cuantizados a w4a16 en la conversión RKNN.

La innovación técnica destacable de esta ficha no está en el entrenamiento, sino en el despliegue: la conversión a RKNN con partición por núcleos NPU (8 núcleos para vision y 8 para LLM), dos perfiles de resolución y checksums SHA-256 por configuración. El pipeline es de una sola imagen por inferencia; la construcción del pipeline completo de PDF (segmentación de páginas, orden de lectura, agregación) debe implementarla la aplicación.

## Capacidades
- Reconocimiento de layout de documentos a partir de imagen de página.
- Extracción de texto de documentos.
- Reconocimiento de formulas matematicas.
- Reconocimiento de tablas.
- Pipeline image-text-to-text (entrada imagen, salida texto estructurado).
- Conversacion multi-turno limitada por la ventana de 8k tokens del LLM.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: no disponibles en la informacion.
- Capacidades especiales (thinking mode, audio): no disponibles en la informacion.

## Casos de uso
- Digitalizacion de PDFs escaneados en dispositivos embebidos: el modelo puede procesar cada pagina como imagen (1.036x1.036 en RK1828) y devolver texto, layout, formulas y tablas, encajando en dispositivos con NPU RK182X sin GPU dedicada.
- Extraccion de tablas de informes financieros o cientificos: la deteccion de tablas permite convertir tablas impresas en estructuras reutilizables, util en pipelines de ingestion documental.
- Conversion de formulas a formato editable: el reconocimiento de formulas habilita pasar apuntes o papers escaneados a LaTeX o formatos matematicos, con la aplicacion encargada del postprocesado.
- Digitalizacion de archivos historicos o administrativos: al ejecutarse en NPU de bajo consumo, permite desplegar el parseo en kioscos, escaneres de red o dispositivos de digitalizacion masiva sin servidores GPU.
- Procesamiento de recibos y facturas en el edge: con la configuracion 448x448 (RK1820/RK1828) se puede hacer extraccion rapida de texto y layout en dispositivos de punto de venta o terminales portatiles.
- Pipeline de accesibilidad documental: conversion de documentos escaneados a texto estructurado para lectores de pantalla o sistemas de busqueda, usando la ventana de 8k tokens para manejar paginas densas.
- Preprocesado para RAG documental: el modelo genera texto y estructura que pueden alimentar un indice de recuperacion, delegando la segmentacion y el orden de lectura a la aplicacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Hardware objetivo: NPU de Rockchip RK182X, concretamente chips RK1820 y RK1828 (no GPU convencional).
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar version en dispositivo con `rknn-smi -v`.
- Configuracion RK1828: resolucion visual 1.036x1.036, vision w4a16, LLM w4a16, 8 nucleos NPU para vision y 8 para LLM, contexto LLM 8.192 tokens, KVCache fp16.
- Configuracion RK1820/RK1828: resolucion visual 448x448, vision w4a16, LLM w4a16, 8 nucleos NPU para vision y 8 para LLM, contexto LLM 8.192 tokens, KVCache fp16.
- VRAM estimada: no disponible (no aplica a NPU embebida).
- GPU recomendadas (A100, H100, RTX 4090): no disponibles; el artefacto esta compilado para NPU RK182X.
- Opciones de despliegue: RKNN Runtime v1.1.0 con las herramientas RKNN Toolkit; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 1,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VLM-MinerU2.5-Pro-2604-1.2B (esta ficha) | 1.2B | 8.192 tokens | NPU RK1820/RK1828 | Apache 2.0 (+ licencias RKNN) | Hugging Face, ModelScope |
| OpenDataLab/MinerU2.5-Pro-2604-1.2B (modelo fuente) | 1.2B | no disponible | GPU convencional (pesos originales) | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas comparables de document parsing | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Solo funciona sobre chips RK1820 y RK1828 con RKNN Runtime v1.1.0 y driver compatible; no es un artefacto para GPU generica.
- Proporciona reconocimiento de una sola imagen de documento; la aplicacion debe implementar el pipeline completo de parseo de PDF (segmentacion, orden de lectura, agregacion).
- Los ficheros de una configuracion deben usarse conjuntamente; mezclar directorios de configuracion distintos puede romper la ejecucion.
- Verificar los checksums SHA-256 antes de desplegar; solo proceder si todas las entradas muestran `OK`.
- La licencia Apache 2.0 del modelo fuente convive con las licencias del RKNN Toolkit y del RKNN Runtime, que tambien aplican al uso.
- Idiomas soportados no declarados: riesgo de rendimiento desigual en documentos en idiomas distintos del dominante en el entrenamiento del modelo fuente (no disponible).
- Riesgo de alucinacion y sesgos del modelo fuente: no hay informacion publicada en esta ficha.
- No hay benchmarks publicados en la informacion disponible, por lo que no se puede validar la precision frente a alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-MinerU2.5-Pro-2604-1.2B
- Modelo fuente en Hugging Face: https://huggingface.co/opendatalab/MinerU2.5-Pro-2604-1.2B
- Modelo fuente en ModelScope: https://modelscope.cn/models/OpenDataLab/MinerU2.5-Pro-2604-1.2B
