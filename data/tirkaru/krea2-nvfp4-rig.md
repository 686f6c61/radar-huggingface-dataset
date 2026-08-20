# Tirkaru/krea2-nvfp4-rig

## Resumen

Este repositorio, creado por Tirkaru, no contiene un modelo de IA en sí, sino un "rig" o entorno de pruebas listo para ejecutar **Krea 2 Turbo en cuantización NVFP4** sobre GPUs Blackwell (RTX 50xx). Su propósito es doble: medir la ganancia de rendimiento de NVFP4 frente a FP8 y verificar si un LoRA de estilo (denominado `ilore`) sobrevive sin degradación a una cuantización de 4 bits. El repo incluye scripts de instalación, un workflow de ComfyUI, utilidades de benchmark y dos checkpoints del LoRA, pero los pesos del modelo base se descargan directamente desde `Comfy-Org/Krea-2` durante la instalación.

Krea 2 es una familia de modelos de generación de imágenes open-source con dos variantes principales: RAW (diseñado para fine-tuning) y Turbo (optimizado para inferencia rápida). Este rig se centra en la variante Turbo, que es un modelo destilado que requiere solo 8 pasos de muestreo con CFG 1.0. La relevancia actual radica en que NVFP4 es un formato de cuantización relativamente nuevo que promete reducir el uso de VRAM a la mitad respecto a FP8, permitiendo ejecutar modelos grandes en GPUs de gama media como la RTX 5080 (16 GB). El repositorio está pensado para arrendar una instancia en vast.ai y probar el stack completo de forma automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (texto a imagen), variante Turbo destilada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | NVFP4 (principal), FP8 (comparativa) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (LoRAs y modelos descargados) |

## Arquitectura y entrenamiento

El repositorio no incluye el modelo base, por lo que la arquitectura detallada de Krea 2 no se documenta aquí. Según la información disponible, Krea 2 Turbo es un modelo de difusión destilado que opera con 8 pasos de muestreo, CFG 1.0 y el sampler `er_sde` con programación `simple`. El LoRA `ilore` está entrenado en dos checkpoints (1000 y 1250 pasos) y se aplica sobre el modelo Turbo. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO). La innovación principal de este rig es la integración de NVFP4, un formato de cuantización de 4 bits que requiere kernels específicos de CUDA 13.0+ y solo funciona en GPUs Blackwell.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con Krea 2 Turbo.
- Aplicacion de un LoRA de estilo artistico (`ilore`) que modifica la pincelada y la estructura del torso en las imagenes generadas.
- Ejecucion en cuantizacion NVFP4 (4 bits) y FP8 (8 bits) para comparacion de rendimiento y calidad.
- Integracion con ComfyUI mediante un workflow predefinido que incluye el nodo de LoRA.
- Automatizacion de la instalacion y descarga de modelos mediante scripts de shell y Python.
- Benchmarking automatizado de velocidad (latencia y throughput) entre NVFP4 y FP8 con y sin LoRA.
- No soporta tool calling, agentes ni capacidades multimodales mas alla de la generacion de imagenes.

## Casos de uso

- **Evaluacion de cuantizacion NVFP4 en produccion**: el rig permite medir de forma reproducible si NVFP4 ofrece una ventaja real sobre FP8 en terminos de velocidad y uso de VRAM, con scripts de benchmark que ejecutan multiples pasadas a resoluciones fijas (1024x1024 y 680x1024).
- **Verificacion de compatibilidad de LoRAs con cuantizacion de 4 bits**: el proposito explicito del autor es comprobar si el LoRA `ilore` sobrevive intacto a la cuantizacion NVFP4, comparando visualmente los resultados con el mismo seed en FP8 y NVFP4.
- **Despliegue de generacion de imagenes en GPUs Blackwell de gama media**: con un stack NVFP4 de 13,16 GB, el modelo cabe completamente en los 16 GB de una RTX 5080, lo que permite ejecutar Krea 2 Turbo en hardware de consumo sin recurrir a GPUs profesionales.
- **Investigacion sobre formatos de cuantizacion de baja precision**: el repositorio sirve como banco de pruebas para estudiar el impacto de NVFP4 en modelos de difusion, especialmente en la preservacion de detalles finos como texturas de pincel.
- **Automatizacion de entornos de arrendamiento en la nube**: los scripts `setup.sh` y `onstart.sh` estan disenados para desplegar el entorno completo en una instancia vast.ai, reduciendo el tiempo de configuracion de horas a minutos.
- **Generacion de imagenes con estilo artistico especifico**: el LoRA `ilore` permite producir imagenes con una estetica particular (pincelada marcada y torso desfragmentado), util para ilustradores o disenadores que buscan un estilo consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un script `bench.py` que mide NVFP4 vs FP8 con y sin LoRA, pero no se proporcionan datos numericos de latencia, throughput o calidad. Tampoco hay comparaciones con otros modelos de generacion de imagenes.

## Requisitos de hardware

- **GPU obligatoria**: Blackwell (RTX 50xx o RTX PRO). NVFP4 no funciona en arquitecturas anteriores (Ampere, Ada Lovelace).
- **VRAM estimada**: el stack NVFP4 completo (modelo + VAE + text encoder) ocupa 13,16 GB, por lo que cabe en una RTX 5080 (16 GB). El stack FP8 ocupa 18,63 GB y no cabe en 16 GB.
- **CUDA**: version 13.0 o superior, requerida por los kernels NVFP4 de `comfy-kitchen`.
- **Disco**: minimo 60 GB para modelos, scripts y dependencias.
- **Opciones de despliegue**: ComfyUI con `comfy-kitchen` (gestion de modelos y kernels), ejecucion local o en instancia vast.ai.
- **Latencia y throughput**: no disponibles; el script `bench.py` esta disenado para medirlos, pero no se han publicado resultados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos de generacion de imagenes. El repositorio se centra en una variante especifica de Krea 2 (Turbo) y su cuantizacion NVFP4. Como referencia, existen otras cuantizaciones del mismo modelo base (FP8, INT8) publicadas por otros autores, pero no se proporcionan datos de rendimiento comparativos. Tampoco se conocen alternativas equivalentes que ofrezcan un rig de pruebas similar para NVFP4.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es privado y requiere un token de HuggingFace con permisos de lectura exclusivos sobre este repo. Un token de cuenta amplio comprometeria otros recursos si la instancia se ve comprometida.
- **Dependencia de hardware especifico**: NVFP4 solo funciona en GPUs Blackwell con CUDA 13.0+. En cualquier otro hardware, el rig no funcionara.
- **Verificacion pendiente del LoRA**: el autor advierte que no esta demostrado que el LoRA `ilore` se comporte identicamente en NVFP4. Es necesario comparar visualmente los resultados con FP8 para detectar degradaciones en la pincelada o en la estructura del torso.
- **Licencia ambigua**: la licencia se indica como "other" sin especificar los terminos exactos. Esto puede limitar el uso comercial o la redistribucion de los scripts y LoRAs.
- **Modelo base no incluido**: el repositorio no contiene los pesos de Krea 2, sino que los descarga de `Comfy-Org/Krea-2`. Esto implica una dependencia de la disponibilidad de esos archivos en HuggingFace.
- **Riesgo de alucinacion visual**: como todo modelo de generacion de imagenes, Krea 2 puede producir artefactos o inconsistencias, especialmente con cuantizaciones agresivas de 4 bits.
- **Sin soporte de negativos**: el workflow usa `ConditioningZeroOut` para el negativo, por lo que los prompts negativos no tienen efecto. Esto puede confundir a usuarios acostumbrados a otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tirkaru/krea2-nvfp4-rig
- Modelo base y cuantizaciones alternativas: https://huggingface.co/Winnougan/Krea-2-Base-Turbo-NVFP4-FP8-INT8
- Guia sobre Krea 2 Raw/Base y Turbo: https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html
- Pagina oficial de Krea 2 Open-Source: https://www.krea.ai/krea-2-open-source
