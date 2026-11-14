# Xylolabs/AREX-2-Tenstorrent-Tensix-BFP8

## Resumen

AREX-2-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo BAAI/AREX-2, un fine-tune orientado a agentes desarrollado por el Beijing Academy of Artificial Intelligence (BAAI) sobre Qwen/Qwen3.8-27B. La versión que nos ocupa, publicada por Xylolabs, convierte las capas lineales del modelo de lenguaje a formato de coma flotante en bloques de 8 bits (`ttnn.bfloat8_b`, BFP8) mediante GPTQ, con el objetivo de ejecutar el modelo en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la torre visual en bf16 y mantiene intactos embeddings, normas y LM head.

El interés de esta ficha radica en que no es un modelo nuevo, sino un artefacto de despliegue: empaqueta 27.356 millones de parámetros en unos 30,96 GB de pesos para dispositivo, con una media efectiva de 9,21 bits por peso. Frente al checkpoint original en bf16, esto reduce aproximadamente a la mitad el espacio necesario, lo que permite que un modelo de 27B quepa en configuraciones de memoria más ajustadas dentro del ecosistema Tenstorrent.

La relevancia actual es doble: por un lado, demuestra un flujo de cuantización GPTQ sobre la retícula nativa de BFP8 que TT-NN puede empaquetar sin alterar valores; por otro, documenta con transparencia las limitaciones del soporte en tt-metal (demo `qwen38_27b_qb2` sobre cuatro chips Blackhole, sin soporte en tt-transformers). Es, por tanto, un artefacto para evaluar despliegues en hardware Tenstorrent más que un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y Gated DeltaNet (derivada de Qwen3.8-27B); torre visual incluida |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`bfloat8_b`, 8,5 bits por peso en capas lineales); bf16 en embeddings, normas, LM head y torre visual; media efectiva de 9,21 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB; pesos empaquetados para dispositivo: 30,96 GB) |

## Arquitectura y entrenamiento

El modelo base BAAI/AREX-2 es un fine-tune de Qwen/Qwen3.8-27B orientado a agentes. Según la model card, la arquitectura combina 16 capas de atención completa (proyecciones q, k, v, o) con 48 capas de Gated DeltaNet (proyecciones q, k, v, z, a, b y salida) y 64 capas MLP (gate, up, down). Esta mezcla de atención clásica y capas de estado recurrente lineal es la que da al modelo su perfil híbrido. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación de esta exportación es puramente de cuantización y despliegue: las matrices lineales se cuantizan con GPTQ directamente sobre la retícula de `ttnn.bfloat8_b`, de modo que cada bloque comparte un exponente tal como lo fija el empaquetador de TT-NN. Los pesos cuantizados se almacenan como valores bf16 situados en la retícula BFP8, de forma que TT-NN los empaqueta sin modificar su valor. La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual permanece en bf16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre visual conservada en bf16.
- Razonamiento y tareas de agente heredadas del fine-tune de BAAI sobre Qwen3.8-27B.
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado directo de los pesos BFP8.
- Capacidades multilingües: no disponibles en la información proporcionada (la calibración incluyó coreano, pero no se documentan los idiomas soportados).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el caso principal. El checkpoint está pensado para ejecutarse en NPU Wormhole o Blackhole mediante TT-NN, empaquetando las matrices BFP8 sin pérdida de valores respecto al checkpoint exportado. Es adecuado cuando la organización ya dispone de hardware Tenstorrent y quiere evitar recompilar el modelo desde bf16.
- Evaluación de cuantización GPTQ sobre BFP8: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado no altera valores, lo que convierte el repo en una referencia para validar pipelines de cuantización en retículas de coma flotante en bloques.
- Prototipado de asistentes multimodales en entornos con memoria limitada: al ocupar 30,96 GB de pesos de lenguaje, es viable en dispositivos con menos memoria que el checkpoint bf16 original, manteniendo la torre visual para tareas de imagen-texto.
- Investigación sobre modelos híbridos atención/DeltaNet: la mezcla de 16 capas de atención completa y 48 de Gated DeltaNet permite estudiar el comportamiento de arquitecturas híbridas bajo cuantización de 8 bits en hardware especializado.
- Integración en demos tensor-parallel: el demo `qwen38_27b_qb2` de tt-metal (v0.81.1) ejecuta el modelo en cuatro chips Blackhole (QuietBox 2); este checkpoint sirve como entrada para ese demo con una política de precisión que mantenga `bfloat8_b`.
- Base para pipelines de agentes en producción interna: al derivar de un fine-tune orientado a agentes, puede emplearse en flujos multi-paso siempre que se valide previamente el soporte real en el hardware objetivo, dado que el propio autor advierte de que el head y la ejecución completa no se probaron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta verificaciones de empaquetado (que el paso a BFP8 no altera los valores de las matrices) y una prueba parcial del demo en el simulador `ttsim` de Blackhole con ttnn 0.81.1, donde el decodificador empaquetó exactamente todas las proyecciones de las capas 0 y 3 bajo una política `bfloat8_b` con fidelidad de cómputo HiFi2.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 30,96 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Alternativa de menor memoria: el autor remite a la versión BFP4 (`Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4`) para dispositivos con menos capacidad.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Ejecución completa: el demo `qwen38_27b_qb2` de tt-metal v0.81.1 requiere cuatro chips Blackhole (QuietBox 2) en paralelo tensorial y rechaza otro hardware.
- GPU consumer: no se documenta soporte; el checkpoint está orientado a TT-NN, no a CUDA. La carga con `transformers` es posible en bf16 con `device_map="auto"`, pero requiere memoria suficiente para 27B en bf16.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado en simulador), demo `qwen38_27b_qb2` de tt-metal, y `transformers` para inspección. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AREX-2-Tenstorrent-Tensix-BFP8 | 27,36B | no disponible | BFP8 (9,21 bits/peso), bf16 en visual y head | Apache-2.0 | Hugging Face, 39 descargas |
| BAAI/AREX-2 (base) | 27,36B | no disponible | bf16 | no disponible en esta ficha | Hugging Face |
| Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4 | no disponible | no disponible | BFP4 | no disponible en esta ficha | Hugging Face |

La comparación con modelos de otros ecosistemas (por ejemplo, alternativas de 27B en CUDA) no está disponible en la información proporcionada, y los datos de rendimiento del base y de la variante BFP4 no se detallan en la model card consultada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual no fue evaluada tras la exportación.
- El head y una ejecución completa del demo no se probaron: requieren los cuatro chips Blackhole y quedan fuera del alcance de la verificación publicada.
- El demo `qwen38_27b_qb2` empaqueta por defecto en `bfloat4_b`, lo que recuantiza estos pesos; es obligatorio escribir una política de precisión propia que mantenga `bfloat8_b` y apuntar `QWEN_PRECISION_CONFIG` a ella.
- tt-transformers no soporta esta arquitectura; el soporte se limita al demo de tt-metal y a la carga con `transformers`.
- El head en bf16 de este checkpoint no es exacto en el demo, que lo fuerza a `bfloat8_b`.
- No se documentan sesgos conocidos, riesgo de alucinación, idiomas soportados ni longitud de contexto; deben validarse antes de cualquier uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base BAAI/AREX-2 deben verificarse por separado.
- El número de descargas (39) y la ausencia de likes indican una adopción muy temprana; no hay evidencia comunitaria de estabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo precursor: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión BFP4: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal `qwen38_27b_qb2`: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2609.38288): no disponible como enlace verificado en la información proporcionada.
