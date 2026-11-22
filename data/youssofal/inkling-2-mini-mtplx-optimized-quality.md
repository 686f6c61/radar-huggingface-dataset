# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality

## Resumen

Inkling 2 Mini Optimized Quality es un empaquetado del modelo Inkling-2-Mini de Thinking Machines Lab, distribuido por Youssofal para su uso con MTPLX, la aplicacion y CLI para ejecutar modelos locales en Apple Silicon. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.388.646.440 parametros totales y 3.400 millones de parametros activos por token, disenado para tareas de codigo, agentes e imagenes. Segun la model card del modelo base, su ventana de contexto alcanza hasta 1.048.576 tokens.

Este pack concreto no modifica los pesos del modelo original: mantiene intactos los pesos de expertos y atencion, e incluye la torre de vision completa y una cabeza de borrador (draft head) para decodificacion especulativa multi-token. La particularidad tecnica del empaquetado es la mezcla de precisiones: los expertos se almacenan en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), mientras que las proyecciones de atencion, la cabeza de salida, el embedding, la torre de vision y la draft head se guardan en BF16. El resultado ocupa 20,2 GB en disco.

Es relevante ahora porque demuestra un pipeline de cuantizacion mixta (NVFP4 + MXFP8) aplicado a un MoE de 26B con vision y decodificacion especulativa, orientado especificamente a Macs con Apple Silicon (M3, M4 y M5). El pack requiere MTPLX 2.13 o superior y esta pensado como la referencia de calidad frente a la que se miden los packs hermanos de velocidad (Bare Speed y Optimized Speed).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de vision y draft head para prediccion multi-token |
| Parametros totales | 26.388.646.440 (26,4 mil millones) |
| Parametros activos | 3.400 millones por token (8 de 128 expertos activados) |
| Longitud de contexto | Hasta 1.048.576 tokens (modelo); el contexto admitido por MTPLX depende de la memoria del Mac (65.536 a 1.048.576 tokens) |
| Tipos de cuantizacion | Expertos en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); atencion, cabeza de salida, embedding, vision y draft head en BF16; variante FP16 para M1/M2 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable del modelo base) |
| Formato de pesos | Safetensors, empaquetado para MTPLX (libreria mtplx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos, de los cuales 8 se activan por token, lo que da 26,4 mil millones de parametros totales y 3,4 mil millones activos. Incluye una torre de vision (pipeline image-text-to-text) y una cabeza de prediccion multi-token (draft head) que se usa para decodificacion especulativa. La model card del pack no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce aqui.

La innovacion del empaquetado es doble. Por un lado, la cuantizacion mixta por capas: los expertos de las primeras 20 capas se guardan en NVFP4 (formato de 4 bits en punto flotante) y los de las capas 20-23 en MXFP8 (8 bits), mientras que las partes sensibles a precision (atencion, embeddings, cabeza de salida, vision y draft head) permanecen en BF16. Por otro lado, la decodificacion especulativa: la draft head propone varios tokens por adelantado y el modelo completo los verifica en una sola pasada, aceptando cada token mediante la regla de razon de probabilidades, de modo que la salida sigue la distribucion propia del modelo a cualquier temperatura. El muestreo recomendado es temperatura 1.0 con top-p 1.0 y sin top-k.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, con enfasis declarado en tareas de programacion y agentes.
- Comprension de imagenes: la torre de vision completa permite leer capturas de pantalla, diagramas y fotografias (pipeline image-text-to-text).
- Decodificacion especulativa integrada mediante draft head, con salida fiel a la distribucion del modelo.
- Contexto largo: hasta 1.048.576 tokens en el modelo, con contextos efectivos de 65.536 a 1.048.576 tokens segun la memoria del Mac.
- Integracion con clientes de agentes y herramientas: MTPLX expone APIs compatibles con OpenAI y Anthropic en local, y lanza clientes como OpenCode, Pi y Hermes.
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion proporcionada).
- Soporte explicito de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: el modelo se puede lanzar con `mtplx start opencode` y usarse como backend de un cliente de programacion sobre el Mac, aprovechando sus 3.400 millones de parametros activos para mantener latencia baja en un MoE de 26B.
- Analisis de capturas de pantalla y diagramas: la torre de vision en BF16 permite enviar imagenes de interfaces, esquemas de arquitectura o errores en pantalla y obtener explicaciones o codigo a partir de ellas.
- Agentes multi-paso con contexto largo: con ventanas de hasta 1.048.576 tokens en Macs de 96 GB o mas, se pueden mantener sesiones de agente con historiales extensos, trazas de herramientas y grandes bases de codigo en el contexto.
- Automatizacion de desarrollo en local: servir el modelo con `mtplx serve` sobre `127.0.0.1:8000` con APIs compatibles OpenAI y Anthropic permite conectarlo a pipelines y scripts existentes sin salir del equipo.
- Procesamiento de documentos tecnicos extensos: el contexto amplio y la comprension de imagenes permiten resumir manuales con figuras, extraer especificaciones de tablas escaneadas y responder preguntas sobre el contenido.
- Prototipado de productos sobre Apple Silicon: el pack Optimized Quality sirve como referencia de calidad para comparar frente a los packs de velocidad (Bare Speed y Optimized Speed) antes de decidir el equilibrio calidad/latencia de un despliegue.
- Investigacion de tecnicas de cuantizacion: la combinacion NVFP4/MXFP8 por capas con partes sensibles en BF16 es un caso practico para estudiar el impacto de la cuantizacion mixta en un MoE con vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente (memoria unificada en Apple Silicon): el pack ocupa 20,2 GB en disco; la memoria pico medida sirviendo un prompt de 4.142 tokens es de 22,4 GiB en un MacBook Pro M5 Max.
- Macs compatibles: M3, M4 y M5 con 32 GB o mas (desde MacBook Air hasta Mac Studio). Los M1 y M2 con 32 GB o mas deben usar la build FP16.
- Macs no compatibles: 8 GB, 16 GB y 18 GB en M3/M4/M5 no admiten el pack; MTPLX recomienda alternativas (Qwen 3.5 4B Optimized Speed o Bonsai 2 27B Optimized Speed). En M1/M2 con 16-24 GB tampoco cabe.
- Contexto segun memoria (M3/M4/M5): 65.536 tokens con 32 GB, 143.360 con 36 GB, 331.776 con 48 GB, 647.168 con 64 GB y 1.048.576 con 96-512 GB. Con 24 GB solo se ofrece el pack Bare Speed.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el pack esta empaquetado para Apple Silicon via MTPLX y no se documenta soporte para GPU NVIDIA.
- Opciones de despliegue: app MTPLX para macOS, CLI `mtplx` (instalable via Homebrew o pip), `mtplx start` para OpenCode, Pi y Hermes, y `mtplx serve` para exponer APIs OpenAI y Anthropic en local.
- Latencia y throughput: no disponibles en la informacion proporcionada, salvo la mencion cualitativa de que la decodificacion especulativa acelera la respuesta manteniendo la distribucion del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Optimized Quality (este pack) | 26,4B | 3,4B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face, via MTPLX en Apple Silicon |
| Inkling 2 Mini Bare Speed | 26,4B (base) | 3,4B | Segun memoria del Mac | Apache 2.0 | Hugging Face, via MTPLX |
| Inkling 2 Mini Optimized Speed | 26,4B (base) | 3,4B | Segun memoria del Mac | Apache 2.0 | Hugging Face, via MTPLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | 3,4B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face |

Los packs hermanos (Bare Speed y Optimized Speed) y sus variantes FP16 para M1/M2 comparten el mismo modelo base y licencia; la diferencia esta en el equilibrio entre calidad y velocidad del empaquetado, no en parametros ni contexto. No se dispone de datos de rendimiento comparativo entre packs en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de MTPLX 2.13 o superior: el pack no carga en MTPLX 2.12, lo que limita su uso a esa version concreta del runtime.
- Exclusivo para Apple Silicon: no se documenta soporte para GPU NVIDIA ni para otros entornos de inferencia (vLLM, llama.cpp, TGI, Ollama); el formato de pesos esta empaquetado para la libreria mtplx.
- Requisito de memoria elevado: no cabe en Macs de 8, 16 o 18 GB (M3/M4/M5) ni en M1/M2 de 16-24 GB; el contexto maximo exige 96 GB o mas de memoria unificada.
- Cuantizacion agresiva en expertos: NVFP4 en las capas 0-19 puede introducir perdida de precision frente al modelo base en BF16; el pack se presenta como referencia de calidad, pero no se aportan metricas de degradacion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni benchmarks; como modelo generativo de 26B, cabe esperar alucinaciones, especialmente en contextos muy largos.
- Sesgos: no disponible; la model card no describe sesgos conocidos del modelo base.
- Idiomas: no disponible; no se especifican idiomas soportados, por lo que la cobertura multilingue no esta garantizada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base esta sujeto a la politica de uso aceptable de Thinking Machines Lab, que debe respetarse.
- Adopcion limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el ecosistema de packs MTPLX es especifico de un autor, lo que reduce la validacion externa.

## Enlaces

- Repositorio del pack: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Pack hermano Bare Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Pack hermano Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Variante Bare Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Variante Optimized Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Variante Optimized Quality FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16
