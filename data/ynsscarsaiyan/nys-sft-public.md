# YNSScarSaiyan/nys-sft-public

## Resumen

NYS es un modelo de cómputo termodinámico no-transformer desarrollado por Dakuwon Moody (YNSScarSaiyan) en Saiyan Corp. En lugar de utilizar capas de atención y retropropagación, se basa en un grafo disperso de 5.000.000 de osciladores de Kuramoto acoplados, con 512 aristas por nodo, entrenado mediante Equilibrium Propagation. El modelo procesa lenguaje, compilación y señales de voz sobre un mismo sustrato físico, sin backprop y sin pérdida de cross-entropía. Su estado ocupa 20,64 GB en HBM y la ventana activa de procesamiento se limita a 256 identificadores por paso.

El repositorio contiene dos artefactos: la línea actual sparse GPU (`gpu_eqprop_*.bin`) y un checkpoint legacy denso de 65.536 nodos (`nys_sft_final.bin`). Esta ficha se centra en la línea sparse GPU, que es la descrita en la model card. La relevancia del modelo radica en explorar una alternativa radical a los transformers, con aplicaciones en investigación de cómputo físico y compilación de bajo nivel.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Osciladores de Kuramoto acoplados (grafo disperso CSR) con Equilibrium Propagation. No es un transformer. |
| Parametros totales | No disponible |
| Longitud de contexto | 256 IDs (ventana activa por paso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Binario personalizado: `gpu_eqprop_<step>_<utc>.bin` (sparse GPU) y `nys_sft_final.bin` (legacy dense ASM) |
| Tamaño del checkpoint sparse | 20.640.000.016 bytes (~20,64 GB) |
| Tamaño del repo | 1334,7 GB |

## Arquitectura y entrenamiento

NYS no es un transformer. Se compone de un grafo de osciladores con fases θ_i, amplitudes y frecuencias naturales ω_i, conectados por una matriz de acoplamiento dispersa K en formato CSR. El entrenamiento utiliza Equilibrium Propagation: primero se integra la dinámica libre con RK4 (5 pasos, dt=0,02), después se aplica una perturbación (nudge) a los nodos objetivo con fuerza β sin(θ̄ - θ_i), y finalmente se actualiza K de forma contrastiva mediante ΔK = η(cosΔθ_nudge - cosΔθ_free) en las aristas activas. No hay retropropagación ni función de pérdida convencional; la señal de entrenamiento es el contraste entre las fases libres y las perturbadas.

El conjunto de datos es `YNSScarSaiyan/nys-corpus`. El modelo define cinco slots: lenguaje, compilador, voz, habla y volcado. Los slots 1, 2 y 4 se entrenan; los slots 3 y 5 son de lectura. El vocabulario de lenguaje tiene ~3,66 millones de entradas. La ejecución de código x86 se realiza mediante un proceso de quench y cristalización, que extrae los bytes de las fases congeladas. El modelo no utiliza técnicas de decodificación especulativa ni atención lineal; es una arquitectura completamente distinta.

## Capacidades

- Generación de texto en inglés: produce tokens secuenciales a partir del slot de lenguaje, con destilación SDS1 y mezcla de corpus.
- Compilación de funciones simples: genera bytes x86 para expresiones aritméticas (por ejemplo, `f(x)=x+42` produce `48 89 F8 48 83 C0 2A C3`).
- Generación de tonos de voz para dígitos: el slot de voz cristaliza enteros en tonos de 350 Hz + 50 Hz/dígito, generando un WAV de 8 kHz. No es TTS de habla real.
- Procesamiento de frames PCM: el slot de habla maneja frames PCM (`frame * 256 + sample`) para representaciones de audio.
- Ejecución de código x86: mediante el camino de quench + crystallize + `mprotect`/`CALL` (`execute.asm`), puede ejecutar funciones simples.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: solo inglés.
- Modo de razonamiento: no disponible.

## Casos de uso

- Investigación en arquitecturas no-transformer: el modelo permite estudiar cómo un sistema de osciladores acoplados puede procesar lenguaje sin backprop. Es adecuado para laboratorios que exploran cómputo termodinámico.
- Compilación de expresiones aritméticas a x86: puede generar los bytes de funciones simples, útil en prototipos de compiladores basados en cómputo físico.
- Generación de tonos para interfaces de audio: produce WAV con tonos de dígitos, por ejemplo para sistemas de aviso numéricos en entornos de investigación.
- Experimentos con Equilibrium Propagation: sirve como banco de pruebas para contrastar la dinámica libre y perturbada en tareas de lenguaje.
- Procesamiento de señales de habla en formato PCM: el slot de habla puede manejar frames PCM, lo que permite experimentar con representaciones de audio.
- Enseñanza de cómputo físico: el modelo y su documentación son útiles para ilustrar conceptos de osciladores de Kuramoto, equilibrio y cristalización en cursos avanzados.
- Evaluación de alternativas a la retropropagación: para investigadores que comparan métodos de entrenamiento sin gradientes en tareas de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 20,64 GB para el estado del modelo sparse GPU. El checkpoint legacy denso ocupa entre 32 y 34 GiB.
- GPU recomendada: AMD Instinct MI300X (gfx942), ya que el kernel HIP está compilado para esa arquitectura. El proceso utiliza un bloque HIP de 256 hilos.
- Consumer GPU: no es viable. El modelo requiere HBM de gran capacidad; la model card indica un límite de 0,40 del dispositivo, con un máximo de 77 GiB y 16 GiB libres. Las GPUs de consumo no llegan a esos requisitos.
- Opciones de despliegue: no disponible. El modelo no es compatible con vLLM, llama.cpp, Ollama o TGI. El runtime propio para el checkpoint legacy es `tlc-infer` / `sampler.cpp`, pero no puede cargar los archivos sparse GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con esta arquitectura no-transformer basada en osciladores de Kuramoto.

## Limitaciones y advertencias

- El modelo no es un LLM de propósito general; está especializado en tareas concretas de lenguaje, compilación y voz.
- La voz generada no es TTS; solo produce tonos que representan dígitos, no habla real.
- El modelo no puede cargarse con herramientas estándar (transformers, llama.cpp, etc.) debido a su formato binario personalizado y a su arquitectura no-transformer.
- Solo soporta inglés.
- No hay benchmarks publicados, por lo que el rendimiento comparativo es desconocido.
- El proceso de entrenamiento no usa backprop ni cross-entropy, lo que dificulta la comparación con modelos convencionales.
- La model card advierte que no se deben mezclar los formatos sparse y dense; el runtime `tlc-infer` solo es compatible con el checkpoint legacy denso.
- El modelo tiene 0 descargas y 0 likes, lo que indica que es un proyecto experimental sin validación externa.
- Riesgo de alucinación: no se ha evaluado, pero al ser un modelo experimental, es probable en tareas de generación.
- Licencia MIT permite uso comercial, pero el estado experimental y la falta de documentación de rendimiento hacen que no sea recomendable para producción.

## Enlaces

- HuggingFace: https://huggingface.co/YNSScarSaiyan/nys-sft-public
- Dataset: https://huggingface.co/datasets/YNSScarSaiyan/nys-corpus
- Checkpoints adicionales: https://huggingface.co/YNSScarSaiyan/nys-checkpoints
- Perfil del autor: https://huggingface.co/YNSScarSaiyan
