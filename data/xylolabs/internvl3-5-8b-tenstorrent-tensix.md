# Xylolabs/InternVL3.5-8B-Tenstorrent-Tensix

## Resumen

InternVL3.5-8B-Tenstorrent-Tensix es una cuantización del modelo de lenguaje InternVL3.5-8B de OpenGVLab, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El paquete contiene únicamente la torre de texto del modelo multimodal original: se han eliminado el codificador visual, el proyector y las entradas de imagen o vídeo, por lo que el resultado es un modelo de generación de texto puro. La cuantización emplea el formato block-floating-point `bfloat4_b` (BFP4) en las capas de atención y MLP, manteniendo el resto de pesos en bf16.

El modelo base InternVL3.5-8B es un transformer multimodal de la familia InternVL3.5, construido sobre el componente de lenguaje preentrenado Qwen3, que a su vez se carga como `Qwen3ForCausalLM` sin necesidad de código remoto. Esta variante cuantizada reduce el peso empaquetado de 16,38 GB (bf16) a 6,397 GB, con una divergencia media de KL de 0,04864 frente al modelo en bf16 sobre 15.976 posiciones de texto en inglés y coreano.

Su relevancia es doble: por un lado, demuestra que la cuantización BFP4 puede ejecutarse de forma nativa en hardware Tensix mediante `tt-metal` y `ttnn`; por otro, ofrece una alternativa de bajo consumo de memoria para despliegue de un modelo de 8B en aceleradores de Tenstorrent. La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (componente de lenguaje Qwen3, cargado como `Qwen3ForCausalLM`) |
| Parametros totales | 8B (según el nombre del modelo base; no se detalla el desglose exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en atención y MLP; resto en bf16; referencia Q4_K_M de llama.cpp incluida como comparación |
| Idiomas soportados | multilingüe (la validación KL cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `text-bfp4/`, con `quant4.json` y `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base InternVL3.5-8B es un transformer multimodal de la familia InternVL3.5, descrita en el paper arXiv:2508.18265. InternVL3.5 utiliza el modelo preentrenado Qwen3 como componente de lenguaje, lo que explica que esta variante cuantizada se cargue directamente como `Qwen3ForCausalLM` sin código remoto y reutilice el tokenizador y la plantilla de chat del repositorio base. Esta publicación no incluye la torre visual ni el proyector, de modo que el resultado es un modelo de texto puro.

La innovación técnica de esta ficha es la cuantización BFP4 para Tensix. Las capas de atención y MLP se almacenan en formato block-floating-point `bfloat4_b`, mientras que el resto de pesos permanece en bf16. El repositorio incluye scripts propios de Xylolabs para empaquetar matrices (`pack_tensix.py`) y verificar la cuadrícula de cuantización (`verify_grid.py`), que permiten comprobar el round-trip de los valores empaquetados en la NPU. No se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esos detalles pertenecen al modelo base InternVL3.5-8B, no a esta cuantización.

## Capacidades

- Generación de texto multilingüe, heredada del componente Qwen3 del modelo base.
- Conversación multi-turno mediante la plantilla de chat del repositorio base.
- Razonamiento y generación de código, según las capacidades del modelo base InternVL3.5-8B (no verificadas específicamente en esta cuantización).
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante `ttnn` y `tt-metal`.
- Round-trip verificable de pesos cuantizados a BFP4 con los scripts incluidos.
- No incluye capacidades de visión, imagen o vídeo: la torre visual, el proyector y las entradas multimodales han sido eliminados.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para ejecutarse en NPU Wormhole y Blackhole mediante `ttnn`, lo que permite servir generación de texto en hardware Tensix sin GPU convencional.
- Inferencia con memoria reducida: el peso empaquetado de 6,397 GB frente a 16,38 GB en bf16 permite cargar un modelo de 8B en dispositivos con DRAM limitada, a costa de una divergencia KL de 0,04864.
- Evaluación de cuantización BFP4: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir el empaquetado y validar la fidelidad de los pesos, útil para investigadores que estudien formatos block-floating-point.
- Generación de texto en inglés y coreano: la validación KL cubre 15.976 posiciones en ambos idiomas, por lo que es adecuado para cargas de trabajo en esos idiomas con calidad controlada.
- Prototipado de pipelines de texto en entornos Tensix: al cargarse como `Qwen3ForCausalLM` estándar con Transformers, sirve para validar flujos antes de portar a producción en la NPU.
- Comparación de estrategias de cuantización: la model card incluye una referencia Q4_K_M de llama.cpp (5,03 GB, KL 0,05391, 29/33 respuestas correctas) que permite contrastar BFP4 frente a cuantización entera de 4 bits en la misma tarea.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de cuantización:

| Formato | Tamano empaquetado (GB) | KL medio a BF16 | Respuestas correctas (33 items) |
|---|---|---|---|
| `text-bfp4/` (BFP4) | 6,397 | 0,04864 | 28/33 |
| BF16 (mitad de texto del base) | 16,38 | 0 | no disponible |
| Q4_K_M (llama.cpp) | 5,03 | 0,05391 | 29/33 |

La métrica KL se calcula sobre 15.976 posiciones de texto en inglés y coreano, en forma plana y de chat, con un límite de KL medio de 1,5 veces la referencia Q4_K_M. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,397 GB para los pesos empaquetados en BFP4; 16,38 GB si se usa la mitad de texto en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole), ejecutadas mediante `ttnn` y `tt-metal`.
- GPU consumer: no se documenta compatibilidad con GPU; el formato BFP4 está pensado para Tensix. La carga en Transformers con `dtype="bfloat16"` y `device_map="auto"` sugiere que puede ejecutarse en GPU con suficiente memoria para la versión de 16,38 GB, pero no se confirma en la información disponible.
- Opciones de despliegue: `ttnn`/`tt-metal` en Tensix; Transformers (`AutoModelForCausalLM`) para carga estándar; llama.cpp solo como referencia de cuantización Q4_K_M comparativa, no como formato de este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternVL3.5-8B-Tenstorrent-Tensix (este) | 8B (texto) | no disponible | BFP4 + bf16 | Apache 2.0 | Hugging Face, 27 descargas |
| OpenGVLab/InternVL3_5-8B (base) | 8B (multimodal) | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (referencia) | 8B (texto) | no disponible | Q4_K_M | Apache 2.0 (heredada) | Referencia interna en la model card |

La comparación se limita al modelo base y a la referencia de cuantización incluida en la propia model card; no se dispone de datos de benchmarks de tareas para contrastar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo texto: la torre visual, el proyector y las entradas de imagen o vídeo no están incluidos, por lo que no puede usarse para tareas multimodales.
- Divergencia de cuantización: KL medio de 0,04864 frente a bf16 y 28/33 respuestas correctas en la comprobación de 33 ítems, inferior a las 29/33 de Q4_K_M.
- Validación lingüística limitada: la métrica KL solo cubre inglés y coreano; el comportamiento en otros idiomas no está verificado.
- Dependencia de hardware: el formato BFP4 está orientado a NPU Tensix; su uso fuera de ese hardware no está documentado.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; son heredados del modelo base InternVL3.5-8B y de Qwen3.
- Licencia: Apache 2.0, con cambios listados en `NOTICE`; cada carpeta incluye su propia licencia y aviso.
- Repositorio con pocas descargas (27) y sin likes, lo que limita la validación comunitaria.
- Renombrado reciente (2026-11-27) desde `InternVL3.5-8B-Text-Tenstorrent-Tensix-BFP4`; los archivos ahora están en `text-bfp4/`, lo que puede romper rutas antiguas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/InternVL3.5-8B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-8B
- Paper InternVL3.5: https://arxiv.org/abs/2508.18265
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
