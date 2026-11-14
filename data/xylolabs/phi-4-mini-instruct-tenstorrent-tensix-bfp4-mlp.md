# Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-mini-instruct, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila TT-Metal y TT-NN. El modelo conserva la arquitectura transformer del original, pero reescribe su layout a un formato compatible con Llama y aplica cuantización en bloque de punto flotante (block floating point): las matrices del MLP se almacenan en BFP4 y las de atención en BFP8, mientras que embeddings, cabeza de salida y normas permanecen en BF16.

El objetivo es doble: por un lado, reducir la huella de memoria del modelo para que quepa en la memoria de dispositivo de las tarjetas Tensix (unos 4,67 GB para los pesos del modelo de lenguaje, con 3,44 GB de pesos únicos al reutilizar la cabeza atada); por otro, ofrecer un checkpoint listo para empaquetar en TT-NN sin necesidad de recalcular la cuantización. La conversión preserva las dos listas de factores LongRoPE del modelo original y mantiene las 96 dimensiones rotatorias dentro de una representación compatible con Llama de 128 dimensiones.

Con 4.450.618.368 parámetros totales según safetensors (3,836B únicos según la model card), licencia MIT e idioma inglés, el modelo está pensado para generación de texto conversacional y despliegue en hardware Tenstorrent. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la evaluación del autor se limita a una comparación de divergencia KL frente al BF16 original y a una cuantización GGUF Q4_K_M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-mini), layout compatible con Llama |
| Parámetros totales | 4.450.618.368 (safetensors); 3,836B únicos según la model card |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens como frontera de prefijo; factores LongRoPE preservados (contexto extendido no especificado) |
| Tipos de cuantización | BFP4 (MLP gate/up/down, GPTQ plain, damp 0.1), BFP8 (atención q/k/v/o, round to nearest), BF16 (embeddings, cabeza, normas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (valores cuantizados almacenados como BF16 sobre su rejilla BFP) |

## Arquitectura y entrenamiento

El checkpoint parte de microsoft/Phi-4-mini-instruct, un transformer decoder-only denso. La conversión de Xylolabs no reentrena el modelo: transforma el layout a uno compatible con Llama, pliega el factor de atención original en Q/K y conserva las 96 dimensiones rotatorias más las coordenadas pasadas a través en una representación completa de 128 dimensiones. Las dos listas de factores LongRoPE originales (Short y Long) y los metadatos obligatorios de reconstrucción de prefijo permanecen en config.json.

La cuantización aplica GPTQ en formato BFP4 a las tres matrices del MLP (gate, up y down) y redondeo a BFP8 en las proyecciones de atención (q, k, v y output). Las 224 matrices de proyección pasan la comprobación de rejilla, el empaquetado nativo en TT-NN y el empaquetado como BFP8, verificado con TT-NN 0.81.1 y el simulador Blackhole. El archivo contiene 291 entradas de tensor explícitas e incluye una copia exacta del embedding atado como cabeza; ambos tensores son idénticos byte a byte. Los ficheros safetensors ocupan 8,90 GB porque los valores cuantizados se almacenan como BF16.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas de conocimiento general (el ejemplo de la model card es un QA simple).
- Generación con caché de prefijo: requiere el adaptador `install_prefix_rebuild` incluido, que reconstruye el prefijo al cruzar por primera vez los 4.096 tokens.
- Soporte de contexto extendido mediante los factores LongRoPE preservados del modelo original (la model card no detalla la longitud máxima efectiva).
- Capacidades heredadas del modelo base Phi-4-mini (código, matemáticas, tool calling) no verificadas ni documentadas en esta exportación.
- No se documentan capacidades de visión, audio ni modo thinking en esta exportación.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está empaquetado para TT-NN y puede cargarse directamente en tarjetas Tensix (Blackhole verificado con simulador), lo que permite servir el modelo en infraestructura sin GPU convencional.
- Inferencia de bajo consumo en edge con aceleradores Tensix: los 4,67 GB de pesos en dispositivo y la cuantización BFP4 del MLP reducen los requisitos de memoria frente al BF16 original, adecuado para entornos con presupuesto de DRAM limitado.
- Generación conversacional en inglés con contexto medio: útil para asistentes de chat que no superen los 4.096 tokens por turno, donde el adaptador de reconstrucción de prefijo no entra en juego.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de BFP4/BFP8 frente a BF16 y Q4_K_M en tareas de generación, gracias a la métrica de divergencia KL publicada por el autor.
- Prototipado de pipelines TT-Metal: el script `pack_tensix.py` y `verify_grid.py` permiten validar el empaquetado de cada matriz y comprobar que ningún valor cambia tras el round-trip a dispositivo.
- Investigación en formatos block floating point: el checkpoint expone la rejilla BFP y los metadatos de cuantización (`quant4.json`), lo que facilita experimentos sobre precisión y layout en aceleradores.
- Integración en Transformers para pruebas de humo: con Transformers 5.23.0 y `device_map="auto"` puede ejecutarse en GPU/CPU convencional para validar salidas antes de portar a Tensix.

## Benchmarks y rendimiento

| Modelo o referencia | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Respuestas distintas perdidas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 24 | 0 | — |
| Esta exportación | 0,0502733368136 | 29 | 0 | 0 |
| Q4_K_M equivalente | 0,067000 | 26 | 0 | 0 |

La evaluación del autor indica que la exportación alcanza 0,750348 veces la KL de Q4_K_M y no pierde respuestas adicionales. La KL cubre 16.312 posiciones en 16 secuencias guardadas en inglés y coreano, en formato raw y chat. Los siete ítems de tipo thinking no aportan evidencia elegible correcta en BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 4,67 GB para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Pesos únicos: unos 3,44 GB al reutilizar la cabeza atada; el repositorio ocupa 8,90 GB en disco por el almacenamiento en BF16.
- GPU recomendadas: no aplica como destino principal; el objetivo es Tenstorrent Tensix (verificado con TT-NN 0.81.1 y simulador Blackhole).
- GPU consumer: puede cargarse en GPU convencional vía Transformers con `dtype="bfloat16"` y `device_map="auto"`, pero no es el entorno previsto ni se documenta rendimiento.
- Opciones de despliegue: TT-NN/TT-Metal (destino nativo), Transformers 5.23.0 con el adaptador `phi3_longrope_generation`. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 4,45B totales / 3,836B únicos | 4.096 (frontera de prefijo) | BFP4 MLP + BFP8 atención | MIT | Hugging Face, 27 descargas |
| microsoft/Phi-4-mini-instruct | ~3,8B | no disponible en la información | BF16 original | MIT | Hugging Face (modelo base) |
| Cuantización Q4_K_M equivalente | ~3,8B | no disponible | Q4_K_M (GGUF) | MIT (heredada) | Referencia de comparación en la model card |

La comparación con Q4_K_M se limita a la métrica de KL publicada; no hay datos de benchmarks de tarea para ninguno de los tres en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el conjunto de evaluación incluye coreano, pero no se declara como idioma soportado.
- La generación con caché requiere el adaptador `install_prefix_rebuild`; sin él, la generación que cruza los 4.096 tokens puede producir resultados incorrectos.
- El checkpoint está pensado para TT-NN; tt-transformers y tt-forge no se probaron, por lo que la integración en esos stacks no está validada.
- Los ficheros safetensors ocupan 8,90 GB por almacenar valores cuantizados como BF16, lo que duplica aproximadamente la huella en disco frente a los pesos únicos.
- La evaluación publicada es reducida (16 secuencias, 33 ítems normales, 7 de thinking sin evidencia válida) y no sustituye a benchmarks estándar.
- Riesgo de alucinación y sesgos heredados del modelo base Phi-4-mini, no evaluados en esta exportación.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de las herramientas TT-Metal/TT-NN utilizadas.
- No se documentan garantías de latencia ni throughput en hardware Tensix real; la verificación se hizo con simulador Blackhole.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
