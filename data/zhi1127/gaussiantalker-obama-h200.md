# zhi1127/gaussiantalker-obama-h200

## Resumen

GaussianTalker Obama es un modelo específico de personaje (person-specific) para la síntesis de cabezas parlantes (talking-head) a partir de audio, basado en la técnica GaussianTalker que combina representaciones de *Gaussian splatting* 3D con una red de deformación para animar un avatar fotorrealista. Lo publica el usuario zhi1127 en Hugging Face y empaqueta el resultado del entrenamiento sobre la muestra de Obama enlazada desde el repositorio upstream, junto con el código fuente, los activos de inferencia y tres ejemplos de audio preparados. No es un modelo de lenguaje ni un transformer susceptible de cargarse con `from_pretrained`: es una aplicación CUDA a medida.

El problema que resuelve es la animación facial audio-a-vídeo de un sujeto concreto manteniendo su identidad, sin necesidad de reentrenar el avatar ni de hacer *face tracking* nuevo para los ejemplos incluidos. El repositorio contiene la iteración final 10000 del modelo, una instantánea del código upstream (commit `250fb9347dfbd370463c575273cc293547aeeaef`), los activos de validación y el archivo original de parámetros de tracking de aproximadamente 3,3 GB.

Es relevante ahora porque demuestra un flujo de inferencia reproducible sobre GPU Hopper (H200) con cuantización no aplicable (son pesos de red y gaussianas, no un LLM), y porque documenta explícitamente sus límites: es un renderizador offline de retrato que reutiliza poses de cabeza, parpadeos, torso y fondo grabados, y no genera movimiento corporal. El tamaño del repositorio es de 3,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GaussianTalker: Gaussian splatting 3D + red de deformación (aplicación CUDA a medida, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de audio con ventanas de ~25 por segundo, features `[T, 16, 29]`) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones tipo GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (se conservan avisos y licencias originales del código upstream) |
| Formato de pesos | `.pth` (checkpoint PyTorch), gaussianas y estado auxiliar en `models/obama-h100-v1/`; activos en `.pt`/`.npy`/WAV |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema GaussianTalker: un conjunto de gaussianas 3D que representan la cabeza del sujeto, combinado con una red de deformación que las desplaza en función de las features de audio (extraídas con DeepSpeech) y de las señales de pose, parpadeo y torso reutilizadas del conjunto de validación. El repositorio incluye la configuración original de entrenamiento y el checkpoint `chkpnt10000.pth` (iteración 10000), aunque el autor indica que la reanudación del entrenamiento no está validada en este paquete. El directorio se llama `obama-h100-v1` por la GPU de entrenamiento (H100), pero los mismos parámetros se ejecutan en H200.

No se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO, ya que no es un modelo de lenguaje. La innovación técnica destacable es el uso de *Gaussian splatting* para renderizado de retrato fotorrealista con identidad consistente bajo nuevo audio, junto con un empaquetado reproducible que incluye compilación de extensiones CUDA (rasterizador gaussiano y simple-knn para Hopper) con PyTorch 2.5.1 y PyTorch3D 0.7.9 sobre CUDA 12.4.

## Capacidades

- Generación de vídeo de cabeza parlante (audio-to-video) a partir de features de audio DeepSpeech.
- Renderizado de retrato offline a 450 x 450 y 25 FPS.
- Mantenimiento de la identidad del sujeto al ser conducido por audio nuevo.
- Reutilización de poses de cabeza, señales de parpadeo, imágenes de torso y fondo grabados.
- Ejecución de tres ejemplos incluidos: uno autodirigido de 10 s, uno de habla externa corto y uno de 12 s a partir de una respuesta Omni previamente generada.
- Soporte de audio propio mediante extracción de features DeepSpeech con formato `[T, 16, 29]` y manifiesto con rutas relativas o absolutas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No genera movimiento corporal; es un renderizador de retrato.

## Casos de uso

- Investigación en avatares parlantes: permite reproducir el estado del arte de GaussianTalker sobre un sujeto concreto (Obama) sin reentrenar, útil para comparar métodos de animación facial audio-a-vídeo.
- Generación de vídeo sintético etiquetado: los resultados se marcan como sintéticos, lo que facilita su uso en estudios de detección de deepfakes y en evaluación de sistemas de verificación de identidad.
- Demostraciones de audio-a-vídeo en entornos H200: el script `render_demos.py` produce tres MP4 y un manifiesto de resultados, adecuado para validar pipelines de renderizado en clúster.
- Pruebas de reproducibilidad de entornos CUDA: el paquete incluye `setup_h200.sh`, `environment/tested-packages.txt` y `SOURCE_REVISION.json`, lo que permite auditar la cadena de compilación (CUDA 12.4, GCC 12.4.0, Python 3.10.16).
- Evaluación de políticas de reutilización de pose: al poder aportar audio propio dentro de la secuencia de pose de validación, sirve para estudiar cómo afecta la reutilización de pose a la naturalidad del resultado.
- Docencia y divulgación técnica: los ejemplos incluidos y el vídeo de comparación autodirigido permiten explicar Gaussian splatting y redes de deformación con un caso concreto y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: una H200 para la ejecución de los ejemplos; el modelo se entrenó en H100 y los mismos parámetros corren en H200.
- El `render_demos.sbatch` de ejemplo solicita una H200, cuatro CPUs, 32 GiB de RAM de host y diez minutos; el autor aclara que son peticiones de ejemplo, no mínimos medidos.
- Entorno: Python 3.10 (probado), CUDA 12.4 con `nvcc`, GCC 12.4.0, Git y acceso a internet para paquetes Python; PyTorch 2.5.1 con CUDA 12.4 y PyTorch3D 0.7.9.
- Compilación de extensiones nativas: rasterizador gaussiano y simple-knn para Hopper; no se incluye contenedor precompilado.
- Almacenamiento: repositorio de 3,5 GB más el archivo de tracking de ~3,3 GB y el runtime instalado.
- VRAM estimada: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el flujo documentado está orientado a H200/H100.
- Opciones de despliegue: script propio `setup_h200.sh` y `render_demos.py`; no se documenta vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; el único dato es la solicitud de ejemplo de diez minutos para renderizar los tres vídeos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianTalker Obama (este) | Gaussian splatting + red de deformación, person-specific | no disponible | no aplica | no disponible | Hugging Face, repo de 3,5 GB |
| GaussianTalker upstream | Gaussian splatting + red de deformación, código base | no disponible | no aplica | según avisos upstream | Código fuente en el repo (commit `250fb934...`) |
| Alternativas de talking-head audio-a-vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un renderizador offline de retrato: reutiliza poses, parpadeos, torso y fondo grabados y no genera movimiento corporal.
- No es un modelo de lenguaje ni un transformer: no admite `from_pretrained` ni una API de inferencia alojada.
- Solo soporta inglés en los ejemplos y en las features de audio previstas.
- El audio propio debe extraerse con el preprocesado DeepSpeech upstream y respetar el número de frames y la duración; además, debe mantenerse dentro de la secuencia de pose de validación incluida o implementar una política explícita de reutilización de pose.
- El archivo de tracking original (~3,3 GB) se incluye byte a byte y no se reduce; el lector upstream carga `euler`, `trans` y `vertices` aunque haya modelo entrenado.
- La reanudación del entrenamiento desde `chkpnt10000.pth` no está validada.
- El marcador de finalización impide renderizar dos veces el mismo manifiesto; hay que gestionarlo explícitamente para nuevas ejecuciones.
- Licencia no disponible: se conservan los avisos y licencias originales del código upstream, por lo que el uso comercial debe verificarse contra esos términos.
- Riesgo de uso indebido: al ser un generador de vídeo sintético de una persona real, los resultados se etiquetan como sintéticos; conviene mantener esa marca y no presentarlos como reales.
- No se documentan sesgos ni tasas de alucinación (no aplica el concepto de alucinación de texto).

## Enlaces

- Hugging Face: https://huggingface.co/zhi1127/gaussiantalker-obama-h200
- Código upstream incluido en el repo: `GaussianTalker/`, commit `250fb9347dfbd370463c575273cc293547aeeaef` (revisión registrada en `SOURCE_REVISION.json`)
- Scripts incluidos: `install_inference_assets.py`, `setup_h200.sh`, `demos/`, `render_demos.py`, `render_demos.sbatch`, `prepare_demos.py`
- Inventario de entorno: `environment/tested-packages.txt`
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
