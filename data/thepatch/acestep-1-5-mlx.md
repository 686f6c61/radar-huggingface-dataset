# thepatch/acestep-1.5-mlx

## Resumen
ACE-Step 1.5 es un modelo de generacion de musica de codigo abierto desarrollado por ACE Studio y StepFun, capaz de producir canciones completas con voces a partir de una descripcion de estilo y una letra. Este repositorio concreto, preparado por The Patch, contiene los pesos del decodificador y las condiciones del modelo convertidos a formato MLX nativo para Apple Silicon, pensados para un flujo de trabajo de carga y descarga rapida en memoria.

El modelo base es ACE-Step/acestep-v15-xl-base, con una arquitectura de difusion basada en transformer (DiT) y un backend de lenguaje de 5 Hz. La conversion MLX incluye 628 tensores de decodificador y 201 tensores de condicionamiento, con un tamano total de 11,6 GB en precision FP16. Su relevancia radica en que permite ejecutar generacion musical de calidad comercial en hardware de consumo, incluyendo Macs con chip Apple Silicon, con tiempos de generacion inferiores a 2 segundos por cancion en una A100 y menos de 10 segundos en una RTX 3090.

Este repositorio no es un pipeline autonomo: requiere el codigo de ejecucion del proyecto ACE-Step 1.5, el VAE correspondiente, el text encoder y el scheduler. Los pesos estan optimizados para el cargador `MLXDiTDecoder` de Carey/gary4local y no son compatibles directamente con el checkpoint PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con backend LM de 5 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (decodificador) y dtype de origen para condicionamiento |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors nativos MLX (sharded) |

## Arquitectura y entrenamiento
El modelo base ACE-Step 1.5 emplea una arquitectura de difusion basada en transformer (DiT) para la generacion de audio, combinada con un modelo de lenguaje que opera a 5 Hz para el backend. El proceso de generacion sigue un esquema de texto a audio: la entrada de texto (estilo y letra) se codifica mediante un text encoder, se condiciona el proceso de difusion y el VAE decodifica el resultado final en audio. El repositorio MLX contiene exclusivamente los pesos del decodificador DiT y los tensores de condicionamiento, no el pipeline completo.

Los detalles del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La conversion MLX mantiene los nombres de parametros del `MLXDiTDecoder` y los layouts de convolucion nativos de ese cargador, con una validacion exhaustiva que confirma que los 629 tensores convertidos son exactamente iguales a los del checkpoint fuente.

## Capacidades
- Generacion de canciones completas con voces a partir de una descripcion de estilo y una letra.
- Generacion de musica instrumental y vocal con calidad comercial.
- Ejecucion nativa en Apple Silicon mediante MLX, con carga rapida en memoria para flujos de trabajo de un solo uso.
- Soporte para multiples backends: MLX en Apple Silicon, CUDA en NVIDIA, y AMD e Intel.
- Generacion rapida: menos de 2 segundos por cancion en A100 y menos de 10 segundos en RTX 3090.
- No incluye soporte de tool calling, agentes ni razonamiento multi-paso, al ser un modelo de generacion de audio.

## Casos de uso
- Produccion musical independiente: un artista puede generar maquetas completas con voces a partir de una descripcion de estilo y una letra, acelerando el proceso de composicion y arreglo.
- Creacion de contenido para video: generacion de bandas sonoras personalizadas para videos de YouTube, TikTok o redes sociales sin preocuparse por derechos de autor.
- Prototipado rapido para compositores: los musicos pueden explorar diferentes estilos y arreglos generando multiples variaciones de una misma letra en minutos.
- Desarrollo de herramientas de audio: integracion del modelo en aplicaciones de generacion musical local para Mac, aprovechando la carga rapida en memoria para tareas por lotes.
- Educacion musical: uso del modelo como herramienta didactica para demostrar conceptos de composicion, armonia y produccion.
- Generacion de demos para clientes: estudios de grabacion pueden presentar demos vocales e instrumentales a clientes antes de la produccion final.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El proyecto ACE-Step 1.5 menciona en su pagina oficial que supera a la mayoria de alternativas comerciales en metricas de evaluacion comunes, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware
- VRAM estimada: el proceso de validacion del repositorio reporta un pico de 6,97 GB sin swaps en la maquina de prueba, lo que sugiere que cabe en GPUs con 8 GB o mas.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) para la ruta MLX; NVIDIA A100, RTX 3090 y superiores para CUDA.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3090 (menos de 10 segundos por cancion) y probablemente en GPUs con 8 GB de VRAM.
- Opciones de despliegue: el proyecto ACE-Step 1.5 soporta Mac, AMD, Intel y CUDA. Para Apple Silicon se usa MLX; para el resto, PyTorch con MPS o CUDA.
- Latencia: menos de 2 segundos por cancion en A100, menos de 10 segundos en RTX 3090.

## Comparativa con modelos similares
No se dispone de informacion suficiente en los materiales consultados para establecer una comparativa rigurosa con modelos alternativos de generacion musical. El proyecto ACE-Step 1.5 afirma superar a la mayoria de alternativas comerciales, pero no se proporcionan datos concretos de modelos comparables.

## Limitaciones y advertencias
- Este repositorio no es un pipeline autonomo: requiere el codigo de ejecucion de ACE-Step 1.5, el VAE, el text encoder, el scheduler y el runtime correspondiente.
- Los pesos estan optimizados para el cargador `MLXDiTDecoder` de Carey/gary4local; no son compatibles con el checkpoint PyTorch original.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma en los materiales consultados.
- La licencia MIT permite uso comercial, pero se debe verificar la atribucion del proyecto ACE-Step original.
- El repositorio recomienda verificar los hashes SHA-256 tras la descarga y rechazar valores de `format_version` desconocidos por seguridad.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/thepatch/acestep-1.5-mlx
- Modelo base en HuggingFace: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio GitHub del proyecto ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Repositorio GitHub de la integracion MLX: https://github.com/sw30labs/ace-step-1.5-mlx
- Documentacion de la integracion MLX en DeepWiki: https://deepwiki.com/ace-step/ACE-Step-1.5/8.9-mlx-(apple-silicon)-integration
- Pagina oficial del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
