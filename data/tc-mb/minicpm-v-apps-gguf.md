# tc-mb/MiniCPM-V-Apps-gguf

## Resumen

MiniCPM-V-Apps-gguf es un repositorio de distribución de pesos en formato GGUF y ONNX para la familia de modelos MiniCPM-V orientados a aplicaciones de dispositivo (on-device), mantenido por el usuario tc-mb. No se trata de un modelo único entrenado por este autor, sino de un paquete de artefactos derivados de pesos oficiales de OpenBMB: el modelo OCR MiniCPM-OCR-1.0, el modelo visión-lenguaje MiniCPM-V 4.7 en variantes de 1B y 35B-A3B, y componentes del sistema de voz VoxCPM2. El repositorio está pensado para que las aplicaciones de la suite MiniCPM-V-Apps (principalmente en plataformas Apple, a juzgar por las rutas Swift referenciadas) puedan descargar y ejecutar estos modelos localmente.

El interés de este repositorio radica en la cuantización y empaquetado: convierte pesos oficiales en formatos consumibles por llama.cpp y ONNX Runtime, con mezclas de cuantización específicas (Q4_K_M para el tótem OCR, q3gud para el tronco del 35B-A3B, F16 para los proyectores visuales). El recuento de parámetros reportado en safetensors para el repositorio es de 912.440.644, un dato que corresponde a uno de los componentes y no al conjunto completo, dado que el repositorio alberga varios modelos de tamaños muy distintos.

La relevancia actual es doble: por un lado, facilita el despliegue de OCR y visión-lenguaje en dispositivos sin conexión; por otro, el modelo MiniCPM-V 4.7 en su variante 35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con expertos divididos por capas en ficheros `.bin` independientes, lo que permite cargar selectivamente partes del modelo en memoria limitada. La información disponible sobre licencia, idiomas y benchmarks es escasa en la model card, por lo que varios campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de texto + proyector visual); MoE en la variante 35B-A3B; componentes ONNX para deteccion de layout |
| Parametros totales | 912.440.644 (dato de safetensors del repo; no representa el conjunto de todos los artefactos) |
| Parametros activos | no disponible (la variante 35B-A3B sugiere ~3B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, q3gud (mezcla), F16; ONNX para el detector de layout |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF, ONNX, binarios de expertos por capa (`.bin`) |

## Arquitectura y entrenamiento

El repositorio agrupa artefactos de arquitecturas distintas. MiniCPM-OCR-1.0 se compone de una torre de texto cuantizada en Q4_K_M (529 MB), un proyector visual F16 con factor de ampliación 4x (859 MB) y un detector de layout PP-DocLayoutV3 en ONNX (135 MB), lo que configura un pipeline clásico de OCR: detección de regiones, proyección visual y decodificación de texto. MiniCPM-V 4.7 se distribuye en dos escalas: una variante densa de 1B con torre de texto Q4_K_M y torre visual F16, y una variante 35B-A3B con tronco cuantizado en mezcla q3gud y expertos separados por capa en ficheros `.bin` descritos por un `manifest.json`, lo que permite carga parcial. VoxCPM2 aporta un BaseLM en F16 y Q4_K_M junto con un componente acústico, orientado a síntesis de voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. La model card indica que la cuantización Q4 del modelo OCR se generó con `llama-quantize` a partir del F16 oficial de OpenBMB, y que el proyector visual es idéntico byte a byte al oficial (se cita un sha256 parcial), lo que sugiere que el trabajo del autor es de empaquetado y cuantización, no de entrenamiento.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos, con detección de layout previa mediante PP-DocLayoutV3.
- Comprensión visión-lenguaje en las variantes MiniCPM-V 4.7 (1B y 35B-A3B): descripción de imágenes y respuesta a preguntas visuales.
- Procesamiento multimodal con torre visual separada y proyector dedicado.
- Síntesis de voz mediante los componentes VoxCPM2 (BaseLM y módulo acústico).
- Ejecución local en dispositivo gracias a los formatos GGUF y ONNX.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos en aplicaciones móviles: el pipeline OCR (detector de layout ONNX + torre de texto Q4_K_M + proyector F16) permite extraer texto de facturas, formularios y páginas escaneadas sin enviar imágenes a un servidor, con un peso total inferior a 1,6 GB.
- Escaneo de documentos con cámara en iOS: las rutas de la model card (`MiniCPMModelConst+OCR.swift`) indican integración directa en apps Swift, de modo que el modelo puede cargarse desde el bundle o descargarse en el primer arranque.
- Asistencia visual offline: la variante MiniCPM-V 4.7 1B, con torre de texto Q4_K_M y torre visual F16, cabe en dispositivos con memoria unificada moderada y sirve para describir imágenes o responder preguntas sobre capturas de pantalla.
- Procesamiento por capas en equipos con poca memoria: la variante 35B-A3B con expertos en ficheros `.bin` por capa y `manifest.json` permite cargar solo los expertos necesarios, útil en servidores con VRAM limitada o en streaming desde disco.
- Lectura de documentos estructurados: la combinación de detección de layout y OCR facilita extraer tablas y bloques de texto manteniendo el orden de lectura, adecuado para pipelines de extracción de datos.
- Interfaces de voz en local: los componentes VoxCPM2 (BaseLM en F16 o Q4_K_M más módulo acústico) permiten construir asistentes hablados que no dependen de servicios en la nube.
- Prototipado con llama.cpp y ONNX Runtime: al estar los pesos en formatos estándar, se pueden integrar en aplicaciones de escritorio o servidores ligeros sin necesidad de frameworks propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- OCR (MiniCPM-OCR-1.0): torre de texto Q4_K_M de 529 MB más proyector F16 de 859 MB y detector ONNX de 135 MB; en total en torno a 1,5 GB de artefactos, con necesidad de memoria adicional para el runtime. Apto para dispositivos móviles y equipos de escritorio modestos.
- MiniCPM-V 4.7 1B: torre de texto Q4_K_M más torre visual F16; cabe en GPUs de consumo con 4-8 GB de VRAM y en Apple Silicon con memoria unificada.
- MiniCPM-V 4.7 35B-A3B: tronco q3gud más expertos por capa y torre visual F16; requiere carga selectiva de expertos y, por tanto, gestión de memoria fuera del núcleo o streaming desde disco. No se dispone de cifras exactas de VRAM.
- VoxCPM2: BaseLM en F16 y Q4_K_M más componente acústico; el tamaño del repositorio (27,2 GB) sugiere que el conjunto completo exige almacenamiento considerable, aunque cada componente individual es mucho menor.
- Opciones de despliegue: llama.cpp (formatos GGUF), ONNX Runtime (detector de layout), y presumiblemente bindings nativos en Swift para las apps de referencia. No se confirma soporte de vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-Apps-gguf (este repo) | 912M en safetensors reportados; varios artefactos de distinto tamano | no disponible | GGUF, ONNX, bin | no disponible | Paquete de cuantizaciones de modelos OpenBMB para apps on-device |
| MiniCPM-OCR-1.0-gguf (openbmb) | no disponible | no disponible | GGUF | no disponible | Pesos oficiales de origen del OCR incluido aqui |
| MiniCPM-V 4.7 (oficial OpenBMB) | 1B y 35B-A3B | no disponible | safetensors y otros | no disponible | Modelo base del que derivan las cuantizaciones de este repo |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de un uso comercial debe verificarse la licencia de los modelos originales de OpenBMB.
- El recuento de parámetros de safetensors (912.440.644) no refleja el conjunto del repositorio, que contiene varios modelos de escalas muy distintas; no debe usarse como cifra del modelo completo.
- La variante 35B-A3B requiere gestionar la carga de expertos por capa; un uso ingenuo puede exceder la memoria disponible.
- Los pesos están cuantizados (Q4_K_M, q3gud), lo que introduce pérdida de precisión respecto a los originales en F16.
- No hay información sobre sesgos, tasas de alucinación ni evaluación en idiomas distintos del chino e inglés.
- Al ser un repositorio de empaquetado, la calidad final depende de los modelos oficiales de OpenBMB y de la corrección del proceso de cuantización.
- No se documentan límites de contexto ni comportamiento en conversaciones multi-turno largas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tc-mb/MiniCPM-V-Apps-gguf
- Proyecto MiniCPM-V-Apps: https://github.com/OpenBMB/MiniCPM-V-Apps
- Pesos oficiales del OCR: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
