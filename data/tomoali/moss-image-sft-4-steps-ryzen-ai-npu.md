# Tomoali/MOSS-Image-SFT-4-steps-ryzen-ai-npu

## Resumen

MOSS-Image-SFT-4-steps-ryzen-ai-npu es una conversión del modelo de generación de imágenes MOSS-Image-SFT (en su variante destilada a 4 pasos de inferencia, con la LoRA de `akhaliq/MOSS-Image-SFT-4-steps` fusionada) a formato ONNX compilado específicamente para la NPU XDNA 2 de los procesadores AMD Ryzen AI 300. Lo publica el usuario Tomoali como artefacto no oficial, orientado a ejecutar difusión de texto a imagen de forma local en hardware de PC con acelerador neuronal integrado.

El repositorio contiene únicamente el transformer de difusión dividido en dos componentes: las capas FFN comunes a todas las resoluciones (9,0 GB) y las capas de atención específicas para 512×512 (3,8 GB) y 1024×1024 (4,1 GB). El text encoder, el VAE y el tokenizer no se incluyen y deben descargarse desde el modelo original mediante los scripts del repositorio GitHub asociado. Los ficheros se generaron con las herramientas DynamicDispatch de Ryzen AI Software 1.8.0.

Su relevancia es acotada pero concreta: demuestra que un modelo de difusión moderno puede ejecutarse íntegramente en la NPU integrada de un portátil con APU Ryzen AI, con un consumo de CPU mínimo (0,60-0,80 de un núcleo lógico de 16) y sin usar la GPU integrada. No es un modelo entrenado desde cero ni una versión oficial de OpenMOSS; es un artefacto de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MOSS-Image-SFT) compilado a ONNX para NPU XDNA 2; FFN y atención separados por resolución |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; límite de tokens de texto: hasta 192 tokens a 512², hasta 256 tokens a 1024² |
| Tipos de cuantizacion | Cómputo en BFP16 en la NPU; artefactos ONNX compilados (no hay variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (el prompt de texto depende del text encoder de MOSS-Image-SFT) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX compilado para Ryzen AI (DynamicDispatch), con `manifest.json` de tamaños y SHA256 |

## Arquitectura y entrenamiento

El modelo subyacente es MOSS-Image-SFT, un modelo de difusión texto-a-imagen de la familia MOSS (OpenMOSS-Team), en la variante ajustada con una LoRA de 4 pasos que reduce el número de iteraciones de muestreo. Esta conversión no reentrena nada: toma ese modelo base, lo exporta a ONNX y lo compila con las herramientas DynamicDispatch de Ryzen AI Software 1.8.0 para ejecutarse en la NPU XDNA 2. La partición es explícita: 42 bloques transformer, cada uno desdoblado en una parte FFN común (256 filas por llamada, usada en ambas resoluciones) y una parte de atención dependiente de la resolución (1024 tokens de imagen más hasta 192 de texto a 512²; 4096 tokens de imagen más hasta 256 de texto a 1024²).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. La innovación técnica destacable es de despliegue, no de entrenamiento: la NPU calcula en BFP16 y el pipeline híbrido reparte cargas (transformer en NPU, text encoder en CPU, decoder en CPU a 512² y en NPU a 1024² mediante el decoder FLUX.2 compilado de `amd/FLUX.2-klein-4B-amdnpu`). El resultado es determinista para un mismo prompt y semilla, pero no bit-idéntico al pipeline oficial en bf16: la composición difiere porque los bloques finales amplifican las diferencias numéricas del BFP16.

## Capacidades

- Generación de imágenes texto-a-imagen en dos resoluciones soportadas: 512×512 y 1024×1024.
- Muestreo en 4 pasos de difusión gracias a la LoRA destilada fusionada en el modelo base.
- Ejecución del transformer en la NPU XDNA 2 con la GPU integrada inactiva (0 % de uso reportado).
- Generación determinista: mismo prompt y misma semilla producen imágenes bit-idénticas entre ejecuciones.
- Procesamiento por lotes dentro de una misma ejecución (8 imágenes a 512², 6 a 1024² en las mediciones del autor).
- Renderizado de texto en imagen (el autor remite a tablas específicas en el repositorio GitHub; no se aportan resultados en la model card).
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno: es un modelo de difusión, no un LLM.
- No se documentan capacidades multilingües del prompt; dependen del text encoder de MOSS-Image-SFT, no incluido en este repositorio.

## Casos de uso

- Generación de ilustraciones local en portátiles con APU Ryzen AI: el transformer corre en la NPU y la CPU queda casi libre (0,60-0,80 de un núcleo lógico), lo que permite seguir trabajando mientras se generan imágenes de 512² en unos 52 s por imagen en lotes.
- Prototipado de assets para videojuegos o UI: con 1024×1024 y 99 s por imagen en ejecuciones por lotes, sirve para producir variantes de un mismo concepto con prompts y semillas controladas, sin depender de servicios en la nube.
- Entornos con requisitos de privacidad o sin conectividad: al ejecutarse íntegramente en local (NPU y CPU), los prompts y las imágenes no salen del equipo, lo que encaja en flujos con datos sensibles.
- Pruebas de concepto de despliegue en NPU: útil para evaluar el rendimiento real de XDNA 2 con modelos de difusión y comparar latencias frente a GPU integrada o discreta.
- Generación por lotes desatendida: el bajo uso de CPU y la ausencia de carga en iGPU permiten dejar colas de generación en segundo plano en un equipo de trabajo.
- Investigación sobre cuantización y portabilidad: la comparación entre la salida BFP16 en NPU y el pipeline oficial bf16 documentada por el autor sirve para estudiar la sensibilidad numérica de los bloques finales del transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, etc.) en la información disponible. Los únicos datos medidos por el autor son de latencia y uso de recursos en un Ryzen AI 7 PRO 350 (32 GB, driver NPU 32.0.203.329):

| Metrica | 512×512 | 1024×1024 |
|---|---|---|
| Primera imagen (incluye carga de modelo) | 222 s | 277 s |
| Imagen en ejecución por lotes | 52 s (8 imágenes) | 99 s (6 imágenes) |
| Ubicación del transformer | NPU | NPU |
| Ubicación del text encoder | CPU | CPU |
| Ubicación del decoder | CPU | NPU (decoder FLUX.2 de AMD) |
| Uso de GPU integrada | 0 % | 0 % |
| Uso medio de CPU | 0,60-0,80 de un núcleo lógico (de 16) | no disponible por separado |

## Requisitos de hardware

- Sistema operativo: Windows 11 sobre procesador AMD Ryzen AI 300-series con driver de NPU instalado.
- Software: Ryzen AI Software 1.8.0 (instalado desde AMD bajo su propia licencia) y los scripts del repositorio GitHub `tomhda/moss-image-ryzen-ai-npu`.
- Espacio en disco: 12,9 GB para 512² (`common` + `512`) y 13,1 GB para 1024² (`common` + `1024`); hay que sumar el text encoder, VAE, tokenizer y, a 1024², el decoder FLUX.2 descargados aparte.
- Memoria: el equipo de referencia dispone de 32 GB de RAM; no se documenta el mínimo necesario.
- GPU: no se requiere GPU dedicada; la iGPU no se usa (0 %). No hay soporte documentado para CUDA, ROCm ni otras NPU.
- Despliegue: exclusivamente vía ONNX Runtime con el stack de Ryzen AI; no hay soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión en este formato).
- Throughput de referencia: 52 s/imagen a 512² y 99 s/imagen a 1024² en lotes; 222 s y 277 s respectivamente para la primera imagen con carga de modelo incluida.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tomoali/MOSS-Image-SFT-4-steps-ryzen-ai-npu | Difusión 4 pasos, ONNX para NPU XDNA 2 | 512² y 1024² | 192 / 256 tokens | Apache-2.0 | Hugging Face + GitHub (no oficial) |
| akhaliq/MOSS-Image-SFT-4-steps | Difusión 4 pasos, pesos originales | no disponible en la información | no disponible | Apache-2.0 (según modelo base) | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Difusión texto-a-imagen, pesos completos | no disponible en la información | no disponible | Apache-2.0 (según model card citada) | Hugging Face |
| amd/FLUX.2-klein-4B-amdnpu | Difusión (FLUX.2 klein 4B) compilada para NPU AMD | no disponible | no disponible | Apache-2.0 (según model card citada) | Hugging Face |

No se dispone de datos de rendimiento comparativo (calidad de imagen, FID, latencia en el mismo hardware) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto no oficial: el autor lo declara explícitamente como no oficial y remite a `NOTICE.md`; no procede de OpenMOSS ni de AMD.
- Solo contiene el transformer: sin text encoder, VAE ni tokenizer no es autosuficiente; requiere los scripts de descarga del repositorio GitHub.
- Plataforma muy restringida: únicamente Windows 11, Ryzen AI 300-series, driver de NPU y Ryzen AI Software 1.8.0. No funciona en GPU NVIDIA/AMD, Apple Silicon ni NPU de otras marcas.
- Divergencia numérica: la NPU calcula en BFP16 y los bloques finales amplifican las diferencias, por lo que la composición difiere del pipeline oficial en bf16 aunque el resultado sea determinista por semilla.
- Límite de tokens de texto: 192 tokens a 512² y 256 a 1024², lo que restringe prompts largos y descripciones muy detalladas.
- Idiomas del prompt no documentados; dependen del text encoder de MOSS-Image-SFT, no incluido aquí.
- Riesgo de sesgos y alucinación visual heredado del modelo base y de su dataset de entrenamiento, no evaluado en esta conversión.
- Latencia alta para uso interactivo: 52-99 s por imagen incluso en modo lote; la primera generación supera los 3,5 minutos por la carga de modelo.
- Uso comercial: la licencia Apache-2.0 del artefacto lo permite, pero Ryzen AI Software se instala bajo la licencia propia de AMD, que debe revisarse por separado.
- Sin métricas de calidad publicadas: no hay FID, CLIP score ni evaluaciones de fidelidad al prompt en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tomoali/MOSS-Image-SFT-4-steps-ryzen-ai-npu
- Código, instalación y uso: https://github.com/tomhda/moss-image-ryzen-ai-npu
- Modelo base (LoRA 4 pasos fusionada): https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Decoder FLUX.2 compilado para NPU AMD: https://huggingface.co/amd/FLUX.2-klein-4B-amdnpu
- Documentación de Ryzen AI Software 1.8.0: https://ryzenai.docs.amd.com/en/1.8/inst.html
