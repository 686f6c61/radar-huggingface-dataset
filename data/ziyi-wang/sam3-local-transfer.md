# Ziyi-Wang/sam3-local-transfer

## Resumen

`Ziyi-Wang/sam3-local-transfer` no es un modelo nuevo, sino un paquete de transferencia de los pesos completos de `facebook/sam3` (revision fijada en `3c879f39826c281e95690f02c7821c4de09afae7`) acompañado del entorno de ejecución que su autor tenía montado en una máquina local. El repositorio conserva `model.safetensors`, `config.json`, la configuración del processor y todos los recursos del tokenizer, de modo que puede cargarse directamente desde disco con `Sam3Model` y `Sam3Processor` de Transformers sin descargar nada de la red. El checkpoint contiene 859.922.360 parámetros y el repositorio ocupa 4,4 GB, lo que incluye los pesos sin cuantizar más el material de runtime.

El interés práctico del paquete es la reproducibilidad: incorpora scripts de segmentación de imágenes por prompt de texto (`runtime/fixed999/sam_perception.py`), un servicio residente por socket Unix (`perception_session`), el listado exacto de versiones de Python instaladas, un archivo de caché de módulos y manifiestos SHA256 para verificar la integridad de cada fichero. Las versiones de referencia son Python 3.10, Torch 2.5.1+cu118, torchvision 0.20.1+cu118 y Transformers 5.15.0.

Es relevante ahora únicamente como artefacto de empaquetado y replicación de un pipeline de segmentación (mask-generation) sobre SAM3, no como una mejora del modelo base: el autor declara explícitamente que los pesos se conservan tal cual, sin cuantización, poda ni reserializado. El repositorio es privado y requiere autenticación con una cuenta de HuggingFace con permisos de lectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM3 (Segment Anything Model 3), familia de segmentación promptable; el paquete carga la parte de detección de imagen mediante `Sam3Model` a partir de los pesos oficiales de `Sam3VideoModel`. Detalle de backbone y mecanismos de atención: no disponible |
| Parámetros totales | 859.922.360 (dato real del safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | Ninguno incluido; los pesos se distribuyen sin cuantizar. No hay variantes GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio |
| Idiomas soportados | en, zh (según los tags del repositorio; afecta a los prompts de texto) |
| Licencia | SAM License (`license_name: sam-license`, campo `license: other`). Material de terceros con sus propias licencias en `runtime/third_party_licenses/` |
| Formato de pesos | `safetensors` (`model.safetensors`) + `config.json`, processor y tokenizer en formato Transformers |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyacente. La model card indica que el checkpoint proviene de `facebook/sam3` en una revisión concreta y que se conservan todos los tensores originales; no se describe el número de tokens, la composición del dataset, ni si hubo etapas de RLHF/DPO (poco probables en un modelo de segmentación). Tampoco se documenta ninguna innovación técnica propia: el autor no modifica la arquitectura, solo la forma de cargarla.

El único detalle técnico relevante que sí se documenta es el modo de carga: el script local instancia `Sam3Model` (variante de imagen) a partir de un checkpoint oficial de `Sam3VideoModel`, aprovechando el subconjunto de pesos correspondiente a la detección de imagen. El repositorio incluye además una copia del código de inferencia (`runtime/fixed999/`), con umbral de score por defecto de 0,55 y umbral de máscara de 0,5, y una caché de módulos Python (`runtime/sam-python-cache.tar.gz`) que preserva los binarios y metadatos de la máquina de origen para Linux x86_64 y Python 3.10.

## Capacidades

- Segmentación de imagen guiada por prompt de texto: el script acepta uno o varios `--prompt` (por ejemplo, "tennis ball") y genera máscaras de instancia para los conceptos indicados.
- Generación de máscaras de instancia (`pipeline_tag: mask-generation`) con umbrales configurables de score y de máscara.
- Salida estructurada: máscaras, imágenes de superposición y un `report.json` con la procedencia del modelo, los umbrales aplicados y los tiempos de ejecución.
- Procesamiento por lotes sobre imágenes guardadas en disco; no requiere cámara, robot ni entrada en tiempo real.
- Modo servicio: `perception_session` atiende peticiones `status`, `run` y `stop` por socket Unix, lo que permite integrarlo como demonio de segmentación.
- Ejecución en GPU CUDA o en CPU mediante `--device`.
- Etiquetado `feature-extraction`: el checkpoint puede usarse para extraer representaciones, aunque el paquete no incluye ejemplos de ese uso.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o audio: no disponible / no aplica.

## Casos de uso

- Segmentación por concepto en lotes de imágenes: procesar un directorio de fotografías con `python -m fixed999.sam_perception` y un prompt como "tennis ball" para obtener máscaras e informes de tiempo por imagen, útil en anotación semiautomática de datasets.
- Réplica de un entorno de inferencia existente: el paquete permite reconstruir en una segunda máquina el mismo stack (Torch 2.5.1+cu118, Transformers 5.15.0) y verificar con `verify_transfer.py` que los ficheros coinciden byte a byte con el origen mediante `MANIFEST.sha256`.
- Servicio interno de segmentación: desplegar `perception_session` como demonio escuchando en un socket y consumirlo desde otros procesos (por ejemplo, un pipeline de visión) sin recargar el modelo en cada petición.
- Auditoría de artefactos de modelos: usar `transfer_manifest.json` y los SHA256 para comprobar la integridad y la procedencia de un checkpoint antes de incorporarlo a un registro interno de modelos.
- Prototipado de segmentación promptable en investigación: cargar `Sam3Model` y `Sam3Processor` en local con `local_files_only=True` para experimentar con máscaras guiadas por texto en un entorno aislado y sin acceso a la red.
- Extracción de recortes para etapas posteriores: generar máscaras de instancia y recortar las regiones detectadas como entrada de un clasificador o de un sistema de conteo de objetos.
- Referencia de compatibilidad: conservar el archivo de caché y `requirements-exact.txt` como base para depurar diferencias de versiones cuando una implementación de SAM3 se comporta distinto en dos máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de segmentación (mIoU, AP de máscara), comparaciones con el modelo base ni cifras de latencia o throughput más allá de los tiempos que el propio script registra en `report.json` en cada ejecución.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 4,4 GB e incluye pesos sin cuantizar; un checkpoint de 859,9 M de parámetros en fp32 ocupa aproximadamente 3,4 GB, por lo que la inferencia en fp32 necesita del orden de 4-6 GB de VRAM contando activaciones. En fp16/bf16 bajaría a unos 2-3 GB, aunque el paquete no incluye conversión hecha.
- GPU recomendadas: cualquier GPU con soporte CUDA 11.8 y al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070/4070). Para lotes grandes o servicio concurrente, A100, H100 o L40S aportan margen de sobra.
- Cabe en GPU de consumo: sí, previsiblemente en modelos de 8 GB o más; el modo `--device cpu` está soportado de forma explícita para máquinas sin GPU.
- Restricción de plataforma: la caché de módulos incluida es específica de Linux x86_64 con Python 3.10 y CUDA 11.8; en otras plataformas hay que reconstruir el entorno con `runtime/requirements-exact.txt`.
- Opciones de despliegue: Transformers (`Sam3Model` + `Sam3Processor`) de forma nativa; script de línea de órdenes `fixed999.sam_perception`; servicio por socket `fixed999.perception_session`. vLLM, TGI, llama.cpp y Ollama no son aplicables (no es un modelo de lenguaje y no hay pesos GGUF).
- Latencia y throughput: no disponibles. El `report.json` generado por el script permite medirlos por imagen y por prompt en el hardware de destino.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ziyi-Wang/sam3-local-transfer | 859,9 M | Imagen + prompt de texto | Segmentación de instancias | SAM License | Repositorio privado, requiere autenticación |
| facebook/sam3 | No disponible en la información proporcionada (origen de este paquete) | Imagen y vídeo + prompt | Segmentación promptable | SAM License | Público en HuggingFace |
| facebook/sam2 (SAM 2) | No disponible | Imagen y vídeo + prompt | Segmentación promptable | Apache 2.0 | Público |
| facebook/sam-vit-huge (SAM 1) | Aproximadamente 636 M (variante ViT-H) | Imagen + puntos/cajas | Segmentación promptable | Apache 2.0 | Público |

La diferencia práctica frente a las alternativas no está en el rendimiento, sino en el empaquetado: este repositorio es una copia verificable con runtime y scripts incluidos, mientras que los repositorios oficiales distribuyen únicamente pesos y código de referencia. Cualquier comparación de calidad de máscara exigiría benchmarks que no se han publicado aquí.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado por el autor: los pesos son una copia de `facebook/sam3`. El tag `base_model:finetune:facebook/sam3` que aparece en los metadatos no se corresponde con lo que declara la model card, que afirma que no ha habido modificación de pesos.
- El repositorio es privado: sin una cuenta de HuggingFace con permisos de lectura, `hf download` falla. Hay que ejecutar `hf auth login` antes de descargar.
- No se han publicado métricas de calidad, sesgos ni evaluaciones. No hay garantía documentada sobre el comportamiento del modelo en dominios distintos de los evaluados por Meta.
- Riesgo de falsos positivos y negativos en la segmentación: los umbrales por defecto (score 0,55, máscara 0,5) provienen del script original y no están justificados en la documentación; conviene calibrarlos por dominio.
- Cobertura de idiomas limitada a inglés y chino en los prompts de texto según los tags; no hay evidencia de soporte de castellano en la nomenclatura de conceptos.
- La caché `sam-python-cache.tar.gz` contiene binarios compilados para Linux x86_64 / Python 3.10 / CUDA 11.8 y no es portable; el propio autor advierte que no debe tratarse como un entorno Conda completo ni sobrescribir entornos existentes.
- Licencia SAM License (campo `other`, no una licencia OSI estándar): es obligatorio revisar el texto en `LICENSE` y las licencias de terceros antes de cualquier uso comercial o redistribución.
- El paquete no incluye conversiones cuantizadas, por lo que no puede ejecutarse en stacks que solo acepten GGUF u otros formatos ligeros.
- La fecha de creación del repositorio (2026-10-22) y las versiones declaradas (Transformers 5.15.0) deben contrastarse con el entorno real antes de desplegar en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ziyi-Wang/sam3-local-transfer
- Modelo base: https://huggingface.co/facebook/sam3
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las consultas realizadas devolvieron únicamente resultados sin relación con el modelo, por lo que no se incluyen.
