# wirkung/Origami-78B

## Resumen

Origami-78B es un artefacto de inferencia derivado de Aleph-Alpha/Kolibri-1, un modelo de mezcla de expertos (MoE) de 78,10 mil millones de parametros. Lo desarrolla el proyecto Wirkung y se distribuye como una compilacion "sin entrenamiento" (cero pasos de gradiente, cero fine-tuning) que transforma el checkpoint original de 156,21 GB en BF16 en un binario de 26,42 GB, lo que supone una compresion de 5,91x. La propuesta central es la ejecucion de un modelo de gran tamano directamente desde almacenamiento NVMe/SSD mediante `mmap` del sistema operativo, con 0 GB de VRAM de GPU dedicada y 0 GB de RAM dedicada a pesos.

El modelo conserva la topologia completa de Kolibri-1: 50 capas de decodificador, 19.200 expertos enrutados (384 por capa, 3,46B de parametros activos por token), 10 capas de atencion global y 40 capas de ventana deslizante. La innovacion declarada es la sintesis de un estado de sesion constante (O(1)) de 0,183 GB por peticion, independiente de la longitud de contexto, frente al crecimiento lineal del KV cache tradicional (86,08 GB a 1M de tokens en el modelo fuente).

Es relevante ahora porque propone un contrato de ejecucion "cross-silicon" (CPU, NPU, sGPU, Metal, PTX) sin dependencias de PyTorch, vLLM, MLX ni CUDA, reduciendo el stack a `wirkung` + `numpy`. Se trata de una version Preview: las cifras estructurales (huella en disco, ratio de plegado, invariantes de memoria) son propiedades fijas del artefacto, mientras que las cifras de rendimiento dependen del hardware y se remiten al paper de la familia Origami.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (HCGM, Holographic Causal Graph Machine); 50 capas de decodificador, 10 de atencion global y 40 de ventana deslizante |
| Parametros totales | 78,10B |
| Parametros activos | 3,46B por token (384 expertos enrutados por capa, 19.200 en total) |
| Longitud de contexto | Estado constante verificado hasta 5,24M de tokens; banda de atencion global exacta de 4.096 tokens |
| Tipos de cuantizacion | Plegado espectral de 3,5 bits por bloque de 128 (bancos Walsh); FP8/BF16 en el checkpoint fuente; formato propietario `.o1f1` |
| Idiomas soportados | Ingles (en) y aleman (de) |
| Licencia | wirkung-model-and-runtime-1.0 (licencia "other", no estandar) |
| Formato de pesos | 54 shards `.o1f1` (58.703 tensores), round-3 con verificacion SHA-256 bit-lossless |

## Arquitectura y entrenamiento

Origami-78B no se entrena: se compila en forma cerrada a partir de Aleph-Alpha/Kolibri-1 mediante un pipeline de cuatro etapas sin descenso de gradiente. La primera etapa convierte el modelo en un artefacto binario inmutable en disco que el sistema operativo mapea en modo lectura bajo demanda desde SSD/NVMe; bajo el contrato de reduccion entera diadica `v3-exakt`, CPU (AVX2/NEON), NPU, sGPU (`cpu_cuda`), Metal y PTX evaluan reducciones canonicas identicas en lugar de aproximaciones de coma flotante que divergen entre kernels. La segunda etapa aplica un plegado espectral en dos fases: las 57.600 matrices de expertos enrutados se transforman en bancos espectrales Walsh de simetria impar de 3,5 bits por bloque de 128 (38,04 GB intermedios) y se pliegan sin perdida en la ronda `r3` hasta los 26,42 GB finales, con verificacion SHA-256 bit-exacta de los 58.703 tensores.

La tercera etapa sintetiza el carrier `ckv3` de estado constante (0,183 GB por peticion) mediante el motor interno Wirkung: las 10 capas de atencion global combinan una banda exacta de 4.096 tokens, un Sink Token 0 fijado y una resta de media de claves por cabeza de cero bits, lo que acota el estado vivo independientemente de la longitud de secuencia. Ademas, el enrutamiento estratificado por profundidad con perfil `6 / 3 / 4` reduce el trafico de pesos de expertos en un 33% en texto (uniforme k=6 en codigo) sin modificar los pesos del router. La cuarta etapa corresponde a la lectura certificada y la descomposicion de trayectoria en linea.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado `text-generation`.
- Razonamiento y generacion de codigo, con perfil de enrutamiento especifico para codigo (k=6 uniforme).
- Contexto largo: estado constante verificado hasta 5,24M de tokens sin crecimiento del estado vivo.
- Capacidades multilingues limitadas a ingles y aleman.
- Ejecucion sin GPU: CPU, NPU, sGPU, Apple Metal y PTX standalone.
- Verificacion de integridad bit-lossless del artefacto (`wkng verify --full`) y reconstruccion al checkpoint original (`wkng unfold`).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Despliegue en servidores sin GPU: el modelo se ejecuta desde NVMe con 0 GB de VRAM, lo que permite servir un MoE de 78B en hardware de proposito general donde no hay HBM disponible.
- Procesamiento de documentos muy largos: el estado constante de 0,183 GB permite analizar conversaciones o corpus de millones de tokens sin que el consumo de memoria crezca con la longitud, evitando el out-of-memory del KV cache tradicional.
- Asistentes conversacionales en aleman e ingles: el soporte nativo de ambos idiomas y la ventana de contexto extensa encajan en atencion al cliente multi-turno con historial prolongado.
- Generacion de codigo en entornos con recursos restringidos: el perfil de enrutamiento uniforme k=6 para codigo reduce el trafico de expertos y permite integrar el modelo en pipelines de CI/CD sin aceleradores dedicados.
- Inferencia en el borde o en dispositivos embebidos: el contrato cross-silicon (NPU, sGPU, Metal) habilita despliegues en hardware no convencional.
- Archivado y distribucion eficiente de modelos: la compresion 5,91x con verificacion SHA-256 facilita el transporte y la replicacion del checkpoint, con reconstruccion exacta al modelo original mediante `unfold`.
- Investigacion en compilacion de modelos: el artefacto sirve como referencia reproducible de plegado espectral sin reentrenamiento para estudiar tecnicas de compresion lossless.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card omite deliberadamente las cifras de throughput dependientes del hardware y las remite al paper de la familia Origami. Las unicas metricas estructurales publicadas son: compresion de 156,21 GB a 26,42 GB (5,91x), estado vivo constante de 0,183 GB por peticion (0,62 GB de estado de tarjeta verificado hasta 5,24M de tokens), reduccion del 33% en lecturas de expertos en texto y verificacion bit-exacta de 58.703 tensores.

## Requisitos de hardware

- VRAM de GPU: 0 GB requeridos; el modelo se ejecuta desde CPU, NPU, sGPU, Metal o PTX.
- RAM dedicada a pesos: 0 GB; los pesos se leen mediante `mmap` de solo lectura desde SSD/NVMe.
- Almacenamiento: 26,42 GB para el bundle `.o1f1`; se recomienda NVMe por el acceso aleatorio a paginas de operadores.
- Estado por peticion: 0,183 GB constantes, independientemente de la longitud de contexto.
- GPU recomendadas: no aplica como requisito; la model card menciona GPU opcional, pero no especifica modelos (A100, H100, RTX 4090) ni cifras de latencia o throughput.
- Despliegue: runtime propietario `wirkung` (PyPI) con dependencia de `numpy`; no requiere vLLM, llama.cpp, Ollama, TGI, PyTorch, MLX ni CUDA.
- Comandos de despliegue: `pip install -U wirkung && wkng pull wirkung/Origami-78B -o ./Origami-78B`, seguido de `wkng verify ./Origami-78B --full`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM GPU | Formato | Licencia |
|---|---|---|---|---|---|
| Origami-78B | 78,10B (3,46B activos) | Estado constante hasta 5,24M tokens | 0 GB | `.o1f1` (54 shards) | wirkung-model-and-runtime-1.0 |
| Aleph-Alpha/Kolibri-1 (fuente) | 78,10B (3,46B activos) | KV cache lineal (86,08 GB a 1M tokens) | Decenas de GB de HBM | BF16 / FP8 | no disponible en la informacion |
| Alternativas de 70-80B densas o MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es con el checkpoint fuente Kolibri-1, del que Origami-78B hereda la topologia exacta pero reduce la huella en disco 5,91x y elimina el requisito de VRAM. No se dispone de datos de benchmarks que permitan comparar calidad frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Version Preview: el autor la etiqueta explicitamente como preview y remite las cifras de rendimiento al paper; no debe asumirse estabilidad de API ni de formato.
- Idiomas limitados a ingles y aleman; no se documenta soporte de castellano ni de otros idiomas.
- Licencia no estandar (`wirkung-model-and-runtime-1.0`): es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- Dependencia de un runtime propietario (`wirkung`) y de un formato binario propio (`.o1f1`); no es compatible con el ecosistema estandar de inferencia (vLLM, llama.cpp, Transformers).
- El rendimiento depende del almacenamiento: la ejecucion via `mmap` desde SSD/NVMe puede verse limitada por la latencia y el ancho de banda del disco.
- Riesgo de alucinacion y sesgos: no se documenta ninguna evaluacion de sesgos, alineacion ni tasas de alucinacion en la informacion disponible.
- Sin datos publicos de benchmarks de calidad (MMLU, HumanEval, GSM8K), lo que impide validar el rendimiento cognitivo frente al modelo fuente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirkung/Origami-78B
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Paper (PDF en el repositorio): paper/Wirkung_2026_Origami_HCGM.pdf
- DOI: https://doi.org/10.13140/RG.2.2.31826.72647
- Runtime en PyPI: https://pypi.org/project/wirkung/
- Sitio del proyecto: https://wirku.ng
- Contacto: mailto:contact@wirku.ng
- Licencia: LICENSE (en el repositorio)
- Repositorios de primera generacion: https://huggingface.co/tfwnotops
