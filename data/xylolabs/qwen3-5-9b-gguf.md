# Xylolabs/Qwen3.5-9B-GGUF

## Resumen

Xylolabs/Qwen3.5-9B-GGUF es una cuantización GGUF del modelo Qwen3.5-9B de Alibaba Qwen, publicada por Xylolabs como referencia técnica para comparaciones con su stack Tensix. El artefacto contiene el decodificador de texto de 32 capas más un módulo MTP (multi-token prediction) en un único fichero GGUF de 5,780 GB, con tipos de tensor F32, Q4_K y Q6_K, y una media de 5,018 bits por peso almacenado. No incluye el codificador ni el proyector de visión.

El modelo base tiene 9.197.093.888 parámetros y se distribuye bajo licencia Apache 2.0. Esta exportación conserva los pesos MTP, aunque la ruta de generación verificada por el autor utiliza únicamente el decodificador de texto principal; no se reclama ningún resultado de éxito con el drafter MTP. Está pensada para ejecutarse con llama.cpp (la verificación se hizo con la versión v0.9.0) y declara soporte de inglés y coreano.

Su relevancia es acotada: no es un lanzamiento de modelo nuevo ni una cuantización de propósito general optimizada para velocidad, sino un fichero de referencia reproducible que preserva exactamente los tensores, la plantilla de chat y el contrato de tokens de una comprobación concreta frente a BF16. Para desarrolladores que necesiten una referencia Q4_K_M estable de Qwen3.5-9B es útil; para despliegues en producción conviene evaluar otras cuantizaciones del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (32 capas) con módulo MTP; codificador de visión omitido |
| Parametros totales | 9.197.093.888 (modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (los metadatos del modelo se conservan sin cambios; el ejemplo de la model card limita a 2.048 tokens) |
| Tipos de cuantizacion | Q4_K_M (F32: 184 tensores, Q4_K: 223, Q6_K: 35); media de 5,018 bits por peso |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (442 tensores del decodificador de texto + 1 modulo MTP + tokenizer + plantilla de chat) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer decoder-only de 32 capas con 9.197 millones de parámetros. Esta exportación GGUF incluye 442 tensores del decodificador de texto y un módulo MTP adicional, además del tokenizer y la plantilla de chat. Los pesos de visión (codificador y proyector) están explícitamente omitidos, por lo que la entrada de imagen no está disponible en este fichero sin una implementación compatible propia.

La model card no documenta datos de entrenamiento del modelo base (número de tokens, composición del dataset, etapas de RLHF/DPO). La innovación técnica destacable del artefacto es la preservación del módulo MTP, si bien el autor aclara que la ruta de generación verificada usa el decodificador de texto principal y que integrar un drafter MTP requiere su propia implementación y evaluación. El fichero se generó con llama.cpp v0.9.0 y mantiene el contrato de tokens, stop IDs y presupuestos de generación del modelo original.

## Capacidades

- Generación de texto conversacional en inglés y coreano, según los idiomas declarados.
- Razonamiento con modo "thinking" conmutable: el ejemplo usa `--chat-template-kwargs '{"enable_thinking":false}'` para desactivarlo; la evaluación incluye siete recomprobaciones con thinking activado.
- Plantilla de chat compatible con `--jinja` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegues tipo API.
- Pesos MTP presentes para decodificación especulativa, sin garantía de funcionamiento declarada por el autor.
- Capacidades de visión: no disponibles en este fichero (pesos omitidos).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas en la información disponible.

## Casos de uso

- Referencia reproducible para comparación de cuantizaciones: sirve como patrón Q4_K_M fijo frente a BF16 en experimentos de compresión, gracias a la preservación exacta de tensores, plantilla y contrato de tokens.
- Evaluación de calidad de cuantización en inglés y coreano: los conjuntos de verificación del autor cubren texto plano y chat en ambos idiomas, lo que permite replicar la medición de KL y acuerdo top-1.
- Inferencia local en estaciones de trabajo: con 5,77 GB de pesos más KV cache, cabe en GPU de consumo con suficiente VRAM y en CPU vía llama.cpp.
- Prototipado de asistentes conversacionales bilingües en, ko: la plantilla de chat y el modo thinking conmutable facilitan alternar respuestas directas y razonadas.
- Experimentación con decodificación especulativa: los pesos MTP retenidos permiten a un equipo implementar y evaluar su propio drafter, asumiendo el trabajo de integración.
- Base para pipelines de generación de texto en entornos con requisitos de licencia permisiva: Apache 2.0 permite uso comercial sin restricciones adicionales del cuantizador.
- Validación de compatibilidad de llama.cpp: útil para verificar que una build concreta (v0.9.0 en la referencia) reproduce los token IDs y stop IDs esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta una verificación de fidelidad frente a BF16:

| Metrica | Valor |
|---|---|
| Aciertos referencia Q4_K_M | 30/33 + 7/7 |
| Aciertos pase BF16 emparejado | 31/33 + 7/7 |
| Respuestas rotas | 0 |
| Item perdido contabilizado | ko-fact-hangul |
| Secuencias emparejadas | 8 (2.048 tokens cada una) |
| Posiciones puntuadas | 16.312 |
| KL media respecto a BF16 | 0,036694 |
| Acuerdo top-1 | 90,47 % |
| Velocidad | no reportada |

## Requisitos de hardware

- VRAM mínima para pesos: aproximadamente 5,77 GB solo para los pesos GGUF, más espacio para KV cache y buffers.
- VRAM práctica estimada: 7-8 GB para contexto corto (2.048 tokens) y 10-12 GB para contextos mayores, aunque la longitud de contexto real del modelo no está disponible en la información proporcionada.
- GPU de consumo: cabe en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante); en 8 GB el margen para KV cache es ajustado.
- GPU de datacenter: A100, H100 y similares sin problema de capacidad; útiles si se necesita alto throughput con contexto largo.
- Despliegue: llama.cpp (verificado con v0.9.0), `llama-cli` y `llama cli -hf Xylolabs/Qwen3.5-9B-GGUF:Q4_K_M`; también descarga directa del fichero GGUF.
- vLLM, TGI, Ollama: no documentados en la información disponible para este artefacto concreto.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-GGUF | 9,2 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Referencia de cuantización con MTP retenido; sin visión |
| Qwen/Qwen3.5-9B (base) | 9,2 B | no disponible | safetensors (BF16) | Apache 2.0 | Modelo original completo, incluye visión según la referencia del autor |
| Qwen3.5-9B-Tensix-BFP4 (Xylolabs) | 9,2 B | no disponible | BFP4 (Tensix) | Apache 2.0 | Variante del mismo autor para comparación en Tensix |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- No incluye pesos de visión: el codificador y el proyector están omitidos, por lo que la entrada de imagen no funciona sin una implementación compatible propia.
- Los pesos MTP se conservan pero no hay reclamación de éxito con el drafter; la ruta verificada es solo el decodificador de texto.
- La verificación se limita a textos almacenados y prompts cortos (2.048 tokens, 33 prompts); no sustituye una evaluación de tareas reales.
- Idiomas declarados únicamente inglés y coreano; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y sesgos del modelo base no cuantificados en la información disponible.
- La pérdida contabilizada en coreano (ko-fact-hangul) indica degradación medible frente a BF16 en ese ítem.
- El autor declara el artefacto "as is", sin garantía ni respaldo del upstream (Qwen); la licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial.
- La fecha de creación del repositorio (2026-11-14) y el recuento de descargas (0) indican un artefacto reciente y sin validación comunitaria.
- Para producción conviene evaluar cuantizaciones alternativas del mismo modelo base y verificar la versión de llama.cpp empleada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF/blob/main/LICENSE
- Variante Tensix BFP4 relacionada: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tensix-BFP4#evaluation
- Repositorio Tensix de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Build de llama.cpp usada en la verificación: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación de GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
