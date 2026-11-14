# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8 es una exportación cuantizada del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura híbrida Nemotron-H del original (atención y capas Mamba-2 con mezcla de expertos) y sustituye las capas lineales por formatos de coma flotante por bloques propios del hardware: bfloat4_b (BFP4) para atención, proyecciones Mamba-2 de entrada y expertos, y bfloat8_b (BFP8) para las proyecciones de salida de Mamba-2.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de cuantización de bajo nivel orientada a aceleradores no convencionales: en lugar de GGUF o AWQ, emplea GPTQ con búsqueda de exponente por bloque sobre una rejilla BFP4/BFP8 que TT-NN empaqueta sin alterar los valores. Por otro, permite ejecutar un modelo de 31.577.940.288 parámetros totales con aproximadamente 18,91 GB de pesos en memoria de dispositivo, lo que lo hace viable en hardware Tensix de gama de inferencia donde un BF16 completo no cabría.

El modelo base es un transformer híbrido con mezcla de expertos (A3B indica unos 3.000 millones de parámetros activos por token), licencia NVIDIA Nemotron Open Model y soporte declarado de inglés, español, francés, alemán, japonés e italiano. Esta exportación concreta está pensada para despliegue en Tensix; la propia model card advierte que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida: atención (6 capas) + Mamba-2 (23 capas) + mezcla de expertos enrutados con experto compartido |
| Parametros totales | 31.577.940.288 |
| Parametros activos | A3B (aproximadamente 3.000 millones por token, segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso) con GPTQ; BFP8 (bfloat8_b, 8,5 bits por peso) con redondeo al más cercano; media de 4,79 bits por peso |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license (other) |
| Formato de pesos | safetensors (repositorio de 63,2 GB), con tensores empaquetados para TT-NN; requiere transformers con custom_code |

## Arquitectura y entrenamiento

La arquitectura subyacente es Nemotron-H: un modelo híbrido que alterna capas de atención con capas Mamba-2 (modelo de espacio de estados) y utiliza mezcla de expertos con experto compartido en las capas Mamba-2. En esta exportación, las 6 capas de atención cuantizan q, k, v y o a bfloat4_b; las 23 capas Mamba-2 cuantizan la proyección de entrada a bfloat4_b y la de salida a bfloat8_b; los expertos enrutados y el experto compartido (up y down) van a bfloat4_b. El embedding, la LM head, las normas y el resto de tensores permanecen en bf16, salvo A_log, D y e_score_correction_bias, que se conservan en float32 sin cambios.

El proceso de cuantización es propio de Xylolabs: GPTQ con búsqueda de exponente por bloque para los tensores BFP4, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, y redondeo al más cercano para los BFP8. Las proyecciones up de los expertos enrutados comparten una única matriz de Hessian por capa; cada down de experto usa la suya o cae a redondeo simple si vio pocos tokens de calibración. Los 6.004 matrices cuantizadas pasaron la comprobación de rejilla, y la verificación de empaquetado TT-NN cubrió las capas 0 y 1 (260 matrices) sin discrepancias tras desempaquetar. No se dispone de información sobre el dataset de preentrenamiento original, el número de tokens ni las fases de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multilingüe en inglés, español, francés, alemán, japonés e italiano.
- Razonamiento y respuesta a preguntas gracias a la combinación de atención y capas de estado recurrente Mamba-2.
- Procesamiento de contextos largos mediante capas Mamba-2, que escalan de forma lineal en coste frente a la atención cuadrática (longitud máxima no especificada).
- Mezcla de expertos con enrutamiento por token y experto compartido, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.
- Ejecución en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos empaquetados en BFP4/BFP8 listos para el dispositivo.
- Compatibilidad con el pipeline text-generation de transformers y con endpoints compatibles.
- Soporte de plantilla de chat (apply_chat_template) para conversaciones multi-turno.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Cargar el checkpoint en una NPU Wormhole o Blackhole con TT-NN permite servir un modelo de 31.600 millones de parámetros con unos 18,91 GB de pesos en DRAM de dispositivo, más KV cache y búferes, sin depender de GPU NVIDIA.
- Inferencia de bajo coste energético en edge o servidores compactos: al usar formatos BFP4/BFP8 nativos del hardware Tensix, se evita la conversión en tiempo de ejecución y se aprovecha el empaquetado directo de TT-NN, lo que reduce la sobrecarga de memoria y el ancho de banda frente a un BF16.
- Asistentes conversacionales multilingües: el modelo cubre seis idiomas y acepta plantillas de chat, por lo que sirve para atención al cliente o asistentes internos en inglés, español, francés, alemán, japonés e italiano.
- Procesamiento de documentos largos: las 23 capas Mamba-2 permiten manejar secuencias extensas con coste lineal, adecuado para resumen y extracción de información sobre textos de varias páginas (siempre que la longitud de contexto del modelo base lo permita).
- Investigación en cuantización para hardware no convencional: el repositorio incluye quant4.json, pack_tensix.py y verify_grid.py, lo que facilita reproducir y auditar el empaquetado BFP4/BFP8 como referencia para otros modelos.
- Prototipado y evaluación comparativa en transformers: la quickstart permite cargar el modelo en una GPU CUDA con transformers 4.57.6 y mamba-ssm 2.3.2.post1 para validar respuestas antes de portar el despliegue a Tensix.
- Fine-tuning o adaptación ligera sobre el modelo base: al ser una exportación cuantizada, no es el punto de partida recomendado para entrenamiento, pero sirve para evaluar el impacto de la cuantización BFP4 en tareas concretas frente al BF16 original.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación que compara fidelidad frente al BF16, pero en la información proporcionada solo aparecen las cabeceras (bits por peso, tamaño en GB, KL medio frente a BF16, Top-1 en porcentaje, respuestas correctas y perdidas); los valores numéricos no están disponibles. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor |
|---|---|
| Bits por peso (media) | 4,79 |
| Tamano empaquetado | 18,91 GB |
| KL medio frente a BF16 | no disponible |
| Top-1 (%) | no disponible |
| Respuestas correctas | no disponible |
| Respuestas perdidas | no disponible |

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 18,91 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y búferes. En una NPU Tensix hay que reservar DRAM adicional según la longitud de secuencia.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante tt-metal, TT-NN y tt-forge.
- GPU para validación en transformers: el código original de NVIDIA requiere GPU CUDA y mamba-ssm para la normalización con compuerta. No se especifican modelos de GPU concretos en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el repositorio de 63,2 GB y los 18,91 GB empaquetados sugieren que en consumer GPU requeriría cuantización adicional o descarga a CPU, no documentada aquí.
- Opciones de despliegue: TT-NN sobre Tensix (vía ttnn.as_tensor con bfloat4_b/bfloat8_b), y transformers 4.57.6 con mamba-ssm 2.3.2.post1 para pruebas en CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. La model card indica que tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que no hay cifras de rendimiento en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, Tensix BFP4) | 31,58 B totales, ~3 B activos | no disponible | BFP4/BFP8 (4,79 bits/peso), 18,91 GB | nvidia-nemotron-open-model-license | Hugging Face, orientado a Tensix |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58 B totales, ~3 B activos | no disponible | BF16 | nvidia-nemotron-open-model-license | Hugging Face, GPU CUDA |
| Modelos MoE de ~30 B con ~3 B activos de otros fabricantes | ~30 B | variable | GGUF/AWQ/etc. | variable | variable |

La comparación directa más fiable es con el modelo base BF16: esta exportación reduce el peso a 18,91 GB y 4,79 bits por peso, a costa de una pérdida de fidelidad que la model card mide con KL y Top-1 (valores no disponibles aquí). Frente a alternativas MoE de tamaño similar, la diferencia clave es el soporte nativo de Tensix, no el rendimiento bruto, que no se ha publicado.

## Limitaciones y advertencias

- Cuantización agresiva: BFP4 en atención, proyecciones de entrada Mamba-2 y expertos puede degradar la calidad frente al BF16; la propia model card reporta métricas de pérdida (KL y respuestas perdidas) que conviene consultar en el repositorio antes de producción.
- Calibración limitada: GPTQ se calibró con 65.536 tokens de WikiText-2 y Wikipedia en coreano; el sesgo de calibración hacia esos dominios e idioma puede afectar a otros.
- Dependencia de hardware: el checkpoint está diseñado para TT-NN en Tensix. tt-transformers y tt-forge no se han probado con él, por lo que el soporte en esos stacks no está garantizado.
- Compatibilidad de software frágil: requiere transformers 4.57.6 y mamba-ssm 2.3.2.post1; es incompatible con transformers 5 y con la API de caché de generación de la versión 5.
- trust_remote_code: la carga exige ejecutar código remoto; la model card recomienda revisar el código incluido antes de habilitarlo.
- Licencia: nvidia-nemotron-open-model-license, no es una licencia OSI estándar; hay que revisar sus términos para uso comercial y redistribución.
- Idiomas: solo se declaran seis idiomas; el rendimiento fuera de ellos no está documentado.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de alucinación en la información disponible.
- Contexto: la longitud máxima de contexto no se especifica, lo que impide garantizar casos de uso de documentos muy largos.
- Madurez: 88 descargas y 1 like en el momento de la ficha; es una exportación reciente (noviembre de 2026) con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8/blob/main/LICENSE
- Paper referenciado (arXiv:2512.20848): https://arxiv.org/abs/2512.20848
