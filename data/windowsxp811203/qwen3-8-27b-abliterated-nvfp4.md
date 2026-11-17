# windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4

## Resumen

Qwen3.8-27B-Abliterated-NVFP4 es una cuantizacion en formato NVFP4 (FP4 de NVIDIA con escalado por bloques) del modelo Qwen3.8-27B-Abliterated, un derivado de la familia Qwen3.5 sometido a un proceso de "abliteration" que elimina los mecanismos de rechazo del modelo original. Lo publica el usuario windowsxp811203 en Hugging Face, no el equipo oficial de Qwen, por lo que se trata de una modificacion comunitaria sobre una base propietaria de Alibaba. El resultado es un modelo multimodal de tipo image-text-to-text, con 19.135.892.976 parametros reales en pesos (pese a la denominacion comercial "27B"), pensado para inferencia eficiente en hardware NVIDIA Blackwell mediante vLLM y el formato compressed-tensors.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion de 4 bits (NVFP4) que reduce el peso del repositorio a 28,6 GB y permite servir un modelo multimodal de ~19B en una sola GPU moderna; por otro, ilustra el ecosistema de variantes "abliterated" y "uncensored", que eliminan deliberadamente las capas de seguridad alineadas. Es un modelo con acceso restringido (gated) y licencia Apache 2.0 declarada, aunque la licencia original del modelo base Qwen condiciona su uso comercial real.

El modelo soporta ingles y chino, incluye soporte declarado de MTP (multi-token prediction) segun sus tags, y esta orientado a generacion de texto conversacional y comprension de imagenes. No se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 19.135.892.976 (pesos reales en safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 / FP4 con compressed-tensors (el repo se declara tambien como 8-bit en tags) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (declarada en el repo; sujeta a la licencia del modelo base Qwen) |
| Formato de pesos | safetensors (cuantizado NVFP4, compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se identifica como `qwen3_5`, un transformer multimodal con pipeline `image-text-to-text`, lo que implica un codificador visual acoplado a un decodificador de lenguaje. El modelo incorpora la etiqueta `mtp`, que en la familia Qwen hace referencia a multi-token prediction, una tecnica de decodificacion especulativa interna que acelera la generacion al predecir varios tokens por paso. No se especifican el numero de capas, dimensiones ocultas, numero de cabezas ni el mecanismo de atencion concreto.

Respecto al entrenamiento, no hay informacion sobre el volumen de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. Lo unico documentado es la cadena de derivacion: un modelo Qwen3.8-27B original, una version "Abliterated" que elimina direcciones de activacion asociadas al rechazo, y esta cuantizacion NVFP4 de esa version. La innovacion tecnica destacable es precisamente la cuantizacion: NVFP4 usa bloques de 16 valores con escalas FP8 y una escala global FP32, lo que preserva mas precision que FP4 ingenuo y esta optimizado para los tensor cores de quinta generacion de NVIDIA (Blackwell).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Comprension de imagenes y respuesta sobre contenido visual (pipeline image-text-to-text).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5.
- Generacion de codigo y matematicas (capacidad esperada del modelo base, no verificada en esta cuantizacion).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Multi-token prediction (MTP) segun tags del repositorio, orientado a acelerar la decodificacion.
- Modo "uncensored": el proceso de abliteration elimina las capas de rechazo, de modo que el modelo responde a peticiones que el original rechazaria.
- Compatibilidad con endpoints y despliegue via vLLM (`endpoints_compatible`, `vllm` en tags).

## Casos de uso

- Procesamiento de documentos con imagenes en ingles o chino: el pipeline image-text-to-text permite extraer y resumir informacion de capturas, formularios o diagramas dentro de un flujo OCR + LLM, desplegado en vLLM sobre una GPU Blackwell.
- Asistente conversacional interno sin filtros corporativos: util para equipos que necesitan respuestas directas sobre temas sensibles (seguridad ofensiva, analisis de contenido) donde un modelo alineado rechazaria la peticion; requiere gobierno de uso y registro de auditoria.
- Generacion de codigo en pipelines de CI/CD: el modelo puede integrarse como servicio de vLLM para autocompletar, revisar y documentar codigo, con la ventaja de que la cuantizacion NVFP4 reduce el coste por token frente a FP16.
- Analisis de imagenes tecnicas: interpretacion de diagramas de arquitectura, esquemas electricos o graficos en entornos de ingenieria, combinando vision y lenguaje en una sola llamada.
- Investigacion sobre alineacion y seguridad: el par modelo base alineado frente a esta variante abliterated permite estudiar empiricamente como el abliteration afecta a la utilidad, la coherencia y la tasa de respuestas daninas.
- Evaluacion de cuantizacion FP4: sirve como banco de pruebas para medir la perdida de calidad de NVFP4 frente a FP16/BF16 en tareas multimodales y multilingues, especialmente en chino.
- Despliegue en hardware limitado: con 28,6 GB de pesos, cabe en una RTX 5090 (32 GB) o en una RTX 6000 Blackwell, lo que permite servir un modelo de ~19B multimodal en una unica GPU de consumo profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~28,6 GB solo para pesos en NVFP4; con cache KV y overhead de vLLM, prever 32-40 GB segun longitud de contexto y tamano de lote.
- GPU recomendadas: NVIDIA Blackwell (RTX 5090, RTX 6000 Blackwell, B200) por el soporte nativo de NVFP4 en tensor cores de quinta generacion; en arquitecturas anteriores (Hopper, Ada) NVFP4 no esta acelerado por hardware y el rendimiento sera poor o requerira conversion.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB con contexto moderado y cuantizacion ya aplicada; no cabe en RTX 4090 (24 GB) sin reducir contexto o descargar capas a CPU.
- Opciones de despliegue: vLLM (recomendado, con soporte compressed-tensors y NVFP4), transformers con el backend adecuado; llama.cpp y Ollama no soportan NVFP4 de forma nativa, por lo que requeririan reconvertir a GGUF.
- Latencia y throughput estimados: no disponibles; el tag MTP sugiere decodificacion especulativa que podria aumentar el throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-NVFP4 (este) | 19,1B | no disponible | Texto + imagen | NVFP4 | Apache 2.0 (declarada) | Gated en HF |
| Qwen3.8-27B-Abliterated (base) | no disponible | no disponible | Texto + imagen | BF16/FP16 | Apache 2.0 (declarada) | HF |
| Qwen3-VL oficial (familia Qwen) | variable (2B-72B) | hasta 256K en variantes recientes | Texto + imagen | BF16, GPTQ, AWQ, GGUF | Apache 2.0 | Publico en HF |

La comparacion con la familia Qwen3-VL oficial es la mas pertinente por tratarse de la misma estirpe arquitectonica, pero no se dispone de datos de rendimiento de esta variante que permitan una comparacion cuantitativa. Frente a la version BF16 del modelo base, la ventaja es el menor footprint (28,6 GB frente a ~38 GB en BF16 para 19B parametros) y el mayor throughput en Blackwell; la desventaja es la perdida de precision inherente a FP4 y la dependencia de hardware NVIDIA reciente.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o inseguro sin filtro. No apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la cuantizacion FP4, que puede degradar la coherencia en tareas de razonamiento largo.
- Solo soporta ingles y chino de forma declarada; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La licencia Apache 2.0 esta declarada en el repositorio, pero el modelo deriva de Qwen (Alibaba); el uso comercial debe verificar la licencia del modelo base original, que puede imponer condiciones adicionales.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad y al despliegue automatizado.
- NVFP4 requiere hardware Blackwell para rendir; en GPUs anteriores el modelo puede no cargar o funcionar con rendimiento muy degradado.
- El tag "8-bit" junto a "nvfp4" y "fp4" sugiere posible ambiguedad en el formato real de los pesos; conviene inspeccionar `config.json` y `quantization_config` antes de desplegar.
- No hay informacion sobre el contexto maximo soportado, lo que impide planificar aplicaciones de contexto largo con garantias.
- Modelo de autor individual sin trayectoria verificable; no hay garantias de mantenimiento, soporte ni correccion de errores.

## Enlaces

- Hugging Face: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4
- Modelo base (Abliterated): https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Repositorio oficial de Qwen en Hugging Face: https://huggingface.co/Qwen
- Documentacion de vLLM: https://docs.vllm.ai
- compressed-tensors (formato de cuantizacion): https://github.com/neuralmagic/compressed-tensors
- Documentacion de NVFP4 en NVIDIA: https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/
