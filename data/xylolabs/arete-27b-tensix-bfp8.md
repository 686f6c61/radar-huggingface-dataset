# Xylolabs/Arete-27B-Tensix-BFP8

## Resumen

Arete-27B-Tensix-BFP8 es una cuantización del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen/Qwen3.8-27B, preparada por Xylolabs para su ejecución en las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva el pipeline de texto e imagen a texto del original (etiqueta image-text-to-text) y aplica redondeo GPTQ sobre la rejilla de coma flotante por bloques bfloat8_b que utiliza la pila TT-NN, de modo que los pesos ya se empaquetan sin un redondeo adicional en el dispositivo.

El checkpoint tiene 27.356.728.560 parámetros y ocupa 54,7 GB en el repositorio. Las capas lineales de atención, del bloque Gated DeltaNet y del MLP se almacenan en bfloat8_b (8,5 bits por peso), mientras que embeddings, LM head, normalizaciones y el módulo visual permanecen en bf16. El resultado es un promedio de 9,21 bits por peso y 30,96 GB empaquetados.

Su relevancia es doble: por un lado, es una de las pocas conversiones públicas orientadas específicamente al hardware de Tenstorrent, un ecosistema con pocos checkpoints listos para usar; por otro, documenta con precisión el proceso de calibración y verificación, incluyendo scripts para comprobar que ningún valor cambia al empaquetar. La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su integración en infraestructuras propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y Gated DeltaNet (familia Qwen3.5/Qwen3.8) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (bfloat8_b, 8,5 bits por peso) en capas lineales; bf16 en embeddings, LM head, normas y módulo visual |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP8), más `quant4.json` e índice de safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino supervisado de Nous Research sobre Qwen3.8-27B. La arquitectura combina 16 capas de atención clásica (proyecciones q, k, v, o) con 48 capas de Gated DeltaNet (proyecciones q, k, v, z, a, b y salida) y 64 capas de MLP (gate, up, down). Esta mezcla de atención y mecanismos de estado recurrente es característica de la familia Qwen3.5/3.8. El checkpoint incluye además un módulo `visual` en bf16, lo que confirma su naturaleza multimodal de entrada imagen-texto.

La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, usando como exponente compartido por bloque el que genera el propio empaquetador. La calibración empleó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Solo se redondeó y evaluó el modelo de lenguaje; el módulo visual se mantiene intacto en bf16. Los pesos se guardan en bf16 pero con cada valor ya situado en la rejilla BFP8, de forma que TT-NN los empaqueta sin volver a redondear. El autor advierte que la prueba en hardware solo se realizó sobre el simulador ttsim de Blackhole con ttnn 0.81.1, no en silicio real.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredados del ajuste supervisado de Nous Research.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con módulo visual en bf16 sin cuantizar.
- Generación de código y matemáticas, capacidades propias de la familia Qwen3.8, aunque no se aportan evaluaciones específicas en esta ficha.
- Soporte multilingüe: la calibración incluyó coreano además de inglés, pero no se detalla la lista de idiomas soportados.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue en infraestructura gestionada.
- Ejecución en NPU Tensix mediante TT-NN y TT-Metal, con empaquetado directo de pesos BFP8.
- No se documentan explícitamente tool calling, function calling, modo thinking ni capacidades de audio en la información disponible.

## Casos de uso

- Despliegue en clústeres Tenstorrent: el checkpoint está pensado para ejecutarse en Wormhole y Blackhole mediante el demo `qwen38_27b_qb2` de TT-Metal, en paralelismo tensorial sobre cuatro chips (QuietBox 2), lo que permite aprovechar NPU de bajo consumo en inferencia de 27B.
- Investigación en cuantización por bloques: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que el empaquetado BFP8 no altera ningún valor, útil para estudiar el impacto del redondeo GPTQ en la rejilla bfloat8_b.
- Asistentes conversacionales autoalojados: al ser un modelo de 27B con licencia Apache 2.0, encaja en servicios de atención al cliente o asistentes internos donde se requiere control total del dato y no se puede depender de API externas.
- Procesamiento de documentos con imagen: la conservación del módulo visual en bf16 permite tareas de descripción de imágenes, extracción de información de capturas o análisis de diagramas combinados con texto.
- Generación de código en pipelines internos: la familia Qwen3.8 rinde bien en tareas de programación, y el formato safetensors facilita su integración en flujos con transformers y `device_map="auto"`.
- Prototipado en GPU convencional: aunque el destino sea Tensix, los pesos en bf16 pueden cargarse con transformers en GPU para validar comportamiento antes de migrar a NPU.
- Evaluación comparativa de precisión: sirve como referencia para medir la degradación de un 27B al pasar de bf16 a BFP8 en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de empaquetado: 9,21 bits por peso de media, 30,96 GB empaquetados y verificación exacta del empaquetado en las capas 0 y 3 del decodificador con la política bfloat8_b.

## Requisitos de hardware

- VRAM estimada en GPU: los pesos en bf16 ocupan aproximadamente 54,7 GB, por lo que se necesita al menos una GPU de 80 GB (A100, H100) o varias en paralelo; no se proporcionan estimaciones para cuantizaciones adicionales.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`. No se indica compatibilidad con GPU de consumo.
- GPU de consumo: no cabe en tarjetas de 24 GB en bf16; no se documenta una versión GGUF ni cuantización de 4 bits para este checkpoint.
- NPU objetivo: Tensix de Tenstorrent, modelos Wormhole y Blackhole. El demo oficial requiere cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware.
- Opciones de despliegue: transformers (carga directa en bf16), TT-NN/TT-Metal con el demo `qwen38_27b_qb2` de la versión v0.81.1, y endpoints compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Las pruebas se realizaron en el simulador ttsim, no en hardware real, por lo que no hay cifras de rendimiento en silicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Tensix-BFP8 | 27,36B | no disponible | BFP8 + bf16 | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (base) | 27B | no disponible | bf16 | no disponible en esta ficha | Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27B | no disponible | bf16 | no disponible en esta ficha | Hugging Face |

La comparación se limita a los modelos citados en la información disponible; no se aportan datos de rendimiento comparado ni de otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo se ha probado en el simulador ttsim de Blackhole con ttnn 0.81.1; no hay validación en hardware Tensix real, y el autor lo indica explícitamente.
- El demo oficial de TT-Metal empaqueta por defecto en bfloat4_b, lo que re-redondea estos pesos; es necesario escribir una política de precisión propia para conservar BFP8.
- El LM head en bf16 del checkpoint no es exacto en el demo, que lo fuerza a bfloat8_b; el autor no probó el head ni una ejecución completa por falta de los cuatro chips.
- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo visual permanece en bf16 y no se ha evaluado su comportamiento tras el proceso.
- No se publican benchmarks de calidad, por lo que se desconoce la degradación real frente al modelo base en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación y sesgos inherentes al modelo base y a su ajuste supervisado; no se documentan mitigaciones específicas.
- No se detalla la lista de idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues con requisitos concretos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base NousResearch/Arete-27B y de Qwen3.8-27B, no incluidas en esta ficha.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tensix-BFP8
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo qwen38_27b_qb2 en TT-Metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Arete-27B-Tensix-BFP8/blob/main/LICENSE
