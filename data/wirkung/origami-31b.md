# wirkung/Origami-31B

## Resumen
Origami-31B es un artefacto compilado del modelo google/gemma-4-31b-it desarrollado por wirkung, presentado como una Holographic Causal Graph Machine (HCGM) en fase Preview. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una recompilación en forma cerrada del checkpoint original de Gemma 4 31B, sin pasos de gradiente ni fine-tuning. El resultado es un binario de 11,56 GB que ejecuta el mismo grafo de 32.680 millones de parámetros, pero con un contrato de memoria constante y sin necesidad de VRAM dedicada en GPU.

La propuesta técnica central es doble: por un lado, un plegado multimodal sin pérdida que reduce el checkpoint BF16 de 62,55 GB a 11,56 GB (factor 5,41x) mediante bitplanos FWHT_128 con scrambling de Rademacher y cristales proyectivos de rango r; por otro, una arquitectura de estado constante O(1) que sustituye el crecimiento lineal del KV cache en las 10 capas de atención global por un carrier simétrico K = V de capacidad fija. El modelo conserva las 50 capas de atención de ventana deslizante, las 10 capas globales, la torre de visión SigLIP de 27 capas y el vocabulario ligado de 262.144 entradas con softcapping logarítmico monótono.

La relevancia actual del proyecto radica en su propuesta de ejecución residente en disco: el artefacto se mapea directamente desde SSD o NVMe mediante mmap del sistema operativo, sin deserializar pesos en RAM ni en VRAM. El runtime `wirkung` (solo requiere numpy) sustituye a vLLM, MLX y Transformers, y ofrece un contrato de reducción entera diádica (`v3-exakt`) que busca resultados idénticos en CPU (AVX2/NEON), NPU, sGPU, Metal y PTX. Es, por tanto, una propuesta orientada a despliegues con memoria acotada y horizontes de contexto largos, no un modelo nuevo en capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Holographic Causal Graph Machine (HCGM); grafo Gemma 4 con 50 capas de atención de ventana deslizante, 10 capas de atención global simétrica K = V y torre de visión SigLIP de 27 capas |
| Parametros totales | 32.680.000.000 (32,68B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra explícita; el estado se mantiene O(1) en horizontes de 4k a 1M tokens según la figura del autor |
| Tipos de cuantizacion | no disponible como lista de cuantizaciones estándar; el artefacto usa plegado en forma cerrada con bitplanos FWHT_128 y cristales proyectivos de rango r, más `exact_core.safetensors` |
| Idiomas soportados | en, de |
| Licencia | wirkung-model-and-runtime-1.0 (license_name: other) |
| Formato de pesos | `.o3f` (601 archivos de operadores de texto, visión y vocabulario) + `exact_core.safetensors`; ejecución vía mmap |

## Arquitectura y entrenamiento
Origami-31B no entrena: compila. El pipeline de cuatro partes descrito por el autor parte del checkpoint BF16 puro de google/gemma-4-31b-it (61,40 GB de pesos activos de texto y visión) y aplica una reducción en forma cerrada sin descenso de gradiente. Los 60 decodificadores, la torre SigLIP de 27 capas y la cabeza ligada de 262.144 filas se empaquetan en 601 archivos `.o3f` mediante bitplanos FWHT_128 con scrambling de Rademacher y cristales proyectivos de rango r (U_r V_r^T). El resultado es un artefacto inmutable de 11,56 GB que se mapea en modo lectura desde SSD/NVMe.

La innovación arquitectónica declarada es el estado constante: las 50 capas locales de ventana deslizante se combinan con un carrier de capacidad fija con sumidero anclado (pinned-sink) en las 10 capas globales simétricas K = V, de modo que la memoria viva de sesión no crece con la longitud T de la secuencia. La ruta de lectura utiliza una compuerta certificada de Cauchy-Schwarz bajo softcapping logarítmico κ tanh(z/κ), con mediana de 2,0 sobre las 262.144 filas y deriva cero según el autor. La reducción se realiza bajo un contrato de enteros diádicos (`v3-exakt`) que busca evaluaciones canónicas idénticas entre CPU, NPU, sGPU, Metal y PTX, en lugar de aproximaciones de coma flotante dependientes del kernel. No se documentan en la información disponible datos de composición del dataset, número de tokens de entrenamiento ni etapas de RLHF/DPO, porque el proceso no incluye entrenamiento.

## Capacidades
- Generación de texto conversacional y razonamiento, heredados del grafo Gemma 4 31B subyacente.
- Procesamiento multimodal de visión y lenguaje gracias a la torre SigLIP de 27 capas conservada en el plegado.
- Ejecución con estado de sesión constante O(1) en horizontes largos (la figura del autor cubre de 4k a 1M tokens).
- Ejecución residente en disco con 0 GB de VRAM dedicada y 0 GB de RAM dedicada a pesos, mediante mmap del sistema operativo.
- Ejecución multiplataforma bajo un mismo contrato: CPU (AVX2/NEON), NPU, sGPU (`cpu_cuda`), Apple Metal y PTX standalone.
- Lectura certificada con compuerta Cauchy-Schwarz bajo softcapping logarítmico monótono, orientada a preservar el orden exacto de argmax.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y alemán según la model card.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso
- Despliegue en servidores sin GPU: el artefacto se ejecuta desde NVMe con mmap y 0 GB de VRAM, lo que permite servir un modelo de 32,68B en máquinas CPU-only o con NPU integrada, útil para entornos con restricciones de hardware o de presupuesto de aceleradores.
- Conversaciones de contexto muy largo: el estado O(1) en las capas globales evita el crecimiento del KV cache, lo que resulta adecuado para sesiones de asistencia o análisis documental que se extienden durante cientos de miles de tokens sin aumentar la memoria viva.
- Procesamiento de documentos con imagen y texto: la torre SigLIP conservada permite tareas de visión-lenguaje, como extracción de información de capturas, formularios o páginas escaneadas, en el mismo artefacto que el texto.
- Despliegue en dispositivos de borde con NPU: el contrato de reducción diádica y la ejecución sin deserialización de pesos facilitan la integración en hardware embebido con NPU, donde no cabe un checkpoint BF16 de 62,55 GB.
- Entornos con almacenamiento rápido y RAM limitada: al no requerir buffers de pesos en host RAM, el modelo encaja en nodos con poca memoria pero SSD NVMe de alta velocidad, por ejemplo funciones serverless con límites estrictos de memoria.
- Reproducibilidad entre silicios: el contrato `v3-exakt` busca evaluaciones canónicas idénticas en CPU, NPU, sGPU, Metal y PTX, lo que sirve para validar resultados entre plataformas en pipelines de investigación.
- Alemán e inglés en producción: el soporte declarado de ambos idiomas permite usarlo en atención al cliente o generación de contenido para esos mercados, con la cautela de que no se documentan evaluaciones de calidad por idioma.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card omite explícitamente las cifras de throughput dependientes del hardware y las remite al paper de la familia Origami. Los únicos datos cuantitativos disponibles son estructurales: 32,68B parámetros, 11,56 GB de huella en disco, factor de compresión 5,41x, 601 archivos `.o3f`, 0 GB de VRAM y estado O(1) de 4k a 1M tokens.

## Requisitos de hardware
- VRAM estimada para inferencia: 0 GB según el autor; la ejecución es residente en disco vía mmap.
- RAM dedicada a pesos: 0 GB según el autor; no hay buffers de deserialización en host RAM.
- Almacenamiento: SSD o NVMe con al menos 11,56 GB libres para el bundle `.o3f` y `exact_core.safetensors`; el rendimiento depende de la latencia y el ancho de banda del almacenamiento.
- GPU recomendadas: no aplica como requisito; el autor menciona ejecución opcional en GPU, sGPU (`cpu_cuda`), Metal y PTX, sin especificar modelos concretos como A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? No aplica en el sentido habitual: no requiere VRAM; la pregunta relevante es el almacenamiento y la CPU/NPU disponibles.
- Opciones de despliegue: runtime `wirkung` (PyPI) con `numpy`; el autor indica que elimina las dependencias de vLLM, MLX y Transformers. Comandos: `pip install -U wirkung`, `wkng pull wirkung/Origami-31B -o ./Origami-31B`, `wkng run ./Origami-31B -p "..." -n 128`.
- Latencia y throughput: no disponibles; la model card los omite y los remite al paper.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM requerida | Licencia | Formato |
|---|---|---|---|---|---|
| Origami-31B (wirkung) | 32,68B | no disponible como cifra; estado O(1) hasta 1M tokens | 0 GB (mmap desde SSD) | wirkung-model-and-runtime-1.0 | `.o3f` + safetensors |
| google/gemma-4-31b-it (base) | 32,68B | no disponible en la información | Decenas de GB de HBM (multi-tens of GB) | licencia de Gemma 4 (no detallada) | BF16 safetensors (62,55 GB) |
| Alternativas de ~30B con cuantización GGUF estándar | ~30B | según modelo | 4-24 GB según cuantización | variable | GGUF |

La comparación directa con otras familias de ~30B no puede completarse con datos de la información proporcionada: no se dispone de benchmarks de Origami-31B ni de cifras de contexto explícitas, y el autor no incluye modelos de referencia. La diferencia verificable frente a su base es la huella (11,56 GB frente a 62,55 GB), la VRAM (0 GB frente a decenas de GB) y el estado de sesión (O(1) frente a O(T)).

## Limitaciones y advertencias
- Es una release Preview: el autor advierte que las cifras de throughput dependientes del hardware no se publican en la model card y quedan en el paper; la validación independiente es inexistente en el momento de la ficha (0 descargas, 0 likes).
- Licencia no estándar: `wirkung-model-and-runtime-1.0` con `license_name: other`; las condiciones exactas de uso comercial no están detalladas en la información disponible y deben revisarse en el archivo LICENSE del repositorio.
- Idiomas limitados a inglés y alemán; no se declara soporte de castellano ni de otras lenguas.
- No se documentan evaluaciones de sesgo, alucinación ni calidad por tarea; al conservar el grafo de Gemma 4 31B, hereda los sesgos y riesgos del modelo base, pero no se aportan mediciones.
- El plegado se presenta como sin pérdida y con orden de argmax preservado, pero no se ofrecen resultados de benchmarks que lo verifiquen de forma independiente.
- Dependencia de almacenamiento: el rendimiento depende de la latencia y el ancho de banda de SSD/NVMe; no se publican cifras de latencia ni de tokens por segundo.
- El runtime `wirkung` es específico del autor y sustituye a vLLM, MLX y Transformers; la integración con ecosistemas estándar (Hugging Face Transformers, TGI, llama.cpp, Ollama) no está documentada.
- El modelo base google/gemma-4-31b-it tiene sus propias condiciones de uso que pueden seguir aplicando al artefacto derivado; conviene verificar la compatibilidad de licencias antes de un despliegue comercial.
- No se dispone de información sobre tool calling, agentes o modo thinking; no deben asumirse en producción sin validación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wirkung/Origami-31B
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Paper (PDF en el repositorio): paper/Wirkung_2026_Origami_HCGM.pdf
- DOI: https://doi.org/10.13140/RG.2.2.31826.72647
- Runtime en PyPI: https://pypi.org/project/wirkung/
- Sitio del autor: https://wirku.ng
- Contacto: mailto:contact@wirku.ng
- Licencia: LICENSE (en el repositorio)
- Releases de primera generación: https://huggingface.co/tfwnotops
