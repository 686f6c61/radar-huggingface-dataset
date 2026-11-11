# wardner/Qwen-Image-2.1

## Resumen

Qwen-Image-2.1 es un modelo de generación de imágenes a partir de texto (text-to-image, T2I) empaquetado por el usuario wardner para su despliegue en hardware de borde basado en NPU de Rockchip. No se distribuye como pesos en formato estándar (safetensors o GGUF), sino como artefactos de despliegue RKNN (grafos y pesos) para las tarjetas de cómputo RK182x y para la NPU integrada del SoC anfitrión RK3588. El modelo genera imágenes de 512×512 píxeles en formato PNG a partir de una descripción textual.

La particularidad técnica del paquete es que el pipeline se reparte entre tres dispositivos de cómputo: el codificador de texto (text encoder) y la cabeza del DiT se ejecutan en la tarjeta EP 0 (RK182x) mediante el runtime RKNN3; el DiT se divide en cuatro segmentos que se ejecutan en la tarjeta EP 1 (RK182x); y la decodificación del VAE recae en la propia NPU del RK3588 anfitrión mediante RKNN2. Esta separación física permite mantener todos los módulos residentes en memoria, de modo que el bucle de generación no realiza ninguna inicialización de modelo (`model_init`) entre imágenes.

El paquete incluye además el manifiesto de worker `qwenimage21.json` para la interfaz web wdnwebui, lo que lo convierte en una unidad de distribución lista para integrarse en un flujo de trabajo de despliegue concreto. Su relevancia radica en demostrar la viabilidad de ejecutar un pipeline T2I completo con un DiT de aproximadamente 4 GB de pesos sobre hardware de borde Rockchip, con un coste de memoria estimado de unos 10,2 GB y un tiempo de inicialización de aproximadamente 110 segundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline T2I con codificador de texto tipo Qwen, DiT (Diffusion Transformer) segmentado en 4 partes y VAE (decoder y encoder); grafos RKNN |
| Parámetros totales | no disponible (el paquete distribuye pesos, no recuento de parámetros) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (se distribuyen grafos RKNN y ficheros de pesos; no se especifica el esquema de cuantización) |
| Idiomas soportados | no disponible (el tokenizador es GPT-2 BPE + ByteLevel; el prompt se procesa a través del codificador de texto) |
| Licencia | qwen-research (license_name: qwen-research, license_link: LICENSE) |
| Formato de pesos | RKNN (grafos `.rknn`) + ficheros `.weight`; tokenizador en GGUF; tabla de embeddings en `.bin` fp16 |
| Tamaño total de pesos | 10,1 GB (repo de 10,8 GB) |
| Resolución de salida | 512×512 PNG |
| Plataforma de destino | RK182x (×2 tarjetas EP) + NPU del host RK3588 |
| Runtime | RKNN3 (tarjetas EP) + RKNN2 (NPU del host) |
| Memoria estimada | ~10 200 MB |
| Tiempo de inicialización | ~110 s |
| Tarjetas requeridas | 2 tarjetas EP + 1 NPU local para el VAE |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de difusión para generación de imágenes compuesto por tres bloques funcionales. El primero es un codificador de texto (text encoder) que transforma el prompt en representaciones internas; se distribuye como grafo RKNN de 7,0 MB acompañado de 3,7 GB de pesos y una tabla de embeddings fp16 de 1,2 GB, con tokenizador GPT-2 BPE + ByteLevel en formato GGUF. El segundo bloque es un DiT (Diffusion Transformer) dividido en una cabeza (`head`) y cuatro segmentos (`seg0` a `seg3`), con un total aproximado de 3,9 GB de pesos; cada segmento pesa entre 970 MB y 989 MB, y la cabeza apenas 46,9 MB. El tercer bloque es el VAE, que se ofrece en dos configuraciones mutuamente excluyentes: decodificador para la NPU del RK3588 (581,6 MB) o decodificador segmentado en cuatro partes para RK182x (unos 477 MB en total), además de un codificador VAE de 205,1 MB para image-to-image.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detalla la innovación arquitectónica interna del DiT más allá de su segmentación para el despliegue. La innovación destacable del paquete es de naturaleza operativa: la separación física del VAE respecto al DiT permite que todos los módulos permanezcan residentes en memoria, de modo que una segunda imagen solo cuesta los pasos de muestreo más la decodificación, sin reinicialización del modelo. El manifiesto `qwenimage21.json` actúa como manual de la unidad de distribución y se mantiene deliberadamente en texto plano (5,9 KB) para poder revisarse y compararse en el Hub.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución fija de 512×512 píxeles y salida en PNG.
- Capacidad declarada en el manifiesto: `swcap_text_to_image`.
- Codificación de imágenes para image-to-image mediante el codificador VAE incluido (205,1 MB, RKNN2 para la NPU del host).
- Procesamiento de prompts textuales mediante tokenizador GPT-2 BPE + ByteLevel y codificador de texto dedicado.
- Ejecución residente en memoria: el bucle de generación no realiza `model_init` entre imágenes, lo que habilita generación repetida con coste reducido.
- Integración con la interfaz web wdnwebui a través del manifiesto de worker y la factoría `qwen_image_21_512`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Generación de imágenes en dispositivos de borde sin conectividad: el pipeline completo se ejecuta sobre dos tarjetas RK182x y la NPU de un RK3588, por lo que puede desplegarse en entornos aislados o con red restringida donde no es viable llamar a una API en la nube.
- Prototipado rápido de conceptos visuales en un equipo de diseño: con una resolución de 512×512 y un tiempo de inicialización de ~110 s, el modelo permite iterar sobre variaciones de un prompt manteniendo los módulos residentes, de modo que las generaciones sucesivas solo pagan los pasos de muestreo y la decodificación.
- Kioscos o instalaciones interactivas: la integración con wdnwebui y el manifiesto de worker permiten exponer la generación de imágenes como servicio local en una interfaz web, con detección automática de la tarjeta de cómputo al escanear el directorio de modelos cada ~2 s sin reiniciar el backend.
- Edición y variación de imágenes existentes: el codificador VAE incluido habilita flujos de image-to-image, útil para aplicar transformaciones estilísticas o variaciones sobre una imagen de entrada en el mismo hardware de borde.
- Investigación en eficiencia de despliegue: la segmentación del DiT en cuatro partes y la distribución del pipeline entre tres dispositivos sirven como banco de pruebas para estudiar reparto de cargas, presupuestos INT por núcleo (el fichero `int_ledger` de 40 B) y latencia en NPUs de Rockchip.
- Generación de recursos gráficos para aplicaciones embebidas: con salida PNG de 512×512 y ejecución local, el modelo puede producir iconos, fondos o ilustraciones para aplicaciones que corren en el propio dispositivo RK3588 sin depender de servicios externos.
- Evaluación de la licencia qwen-research en entornos académicos: al estar orientada a investigación, encaja en proyectos de estudio y experimentación con modelos de difusión en hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas operativas de despliegue: memoria estimada de ~10 200 MB, tiempo de inicialización de ~110 s, tamaño total de pesos de 10,1 GB y salida de 512×512 PNG. No se proporcionan datos de latencia por imagen, throughput, FID, CLIP score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~10 200 MB según el manifiesto del worker.
- Hardware obligatorio: dos tarjetas de cómputo RK182x (tarjetas EP) más la NPU integrada de un SoC anfitrión RK3588 para el VAE.
- No es ejecutable en GPU convencionales (A100, H100, RTX 4090) ni en CPU genérica: los artefactos son grafos RKNN específicos para la NPU de Rockchip y el runtime RKNN2/RKNN3.
- No cabe en GPU de consumo; el destino es hardware de borde Rockchip.
- Opciones de despliegue: runtime RKNN3 en las tarjetas EP y RKNN2 en la NPU del host, orquestado mediante la interfaz web wdnwebui y el manifiesto `qwenimage21.json`. La factoría de worker es `qwen_image_21_512`.
- Instalación: clonar el repositorio en el directorio raíz de modelos (por ejemplo, `/userdata/models/Qwen-Image-2.1`) de modo que la carpeta contenga tanto los pesos como el manifiesto; el backend reescanea el directorio raíz cada ~2 s y detecta la tarjeta sin necesidad de reiniciar. El SDK localiza la carpeta mediante la variable de entorno `WDNAI_QWEN_IMAGE_21_DIR` declarada en el manifiesto.
- Latencia y throughput: no disponibles más allá del tiempo de inicialización (~110 s); no se documenta el tiempo por paso de muestreo ni el tiempo de decodificación.
- Almacenamiento: el repositorio ocupa 10,8 GB; los pesos suman 10,1 GB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El paquete no incluye referencias a otros modelos T2I, ni datos de rendimiento que permitan una comparación cuantitativa. Se indica, por tanto, "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Plataforma | Datos comparativos |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (wardner) | no disponible | no aplica | qwen-research | RK182x ×2 + RK3588 | memoria ~10 200 MB, init ~110 s, salida 512×512 |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es `qwen-research` (license_name: qwen-research), orientada a investigación; debe revisarse el fichero `LICENSE` antes de cualquier uso comercial, ya que las condiciones de uso comercial no se detallan en la información disponible.
- El modelo está empaquetado exclusivamente para hardware Rockchip (RK182x y RK3588); no es portable a GPU, CPU u otras NPU sin una conversión completa a otro formato, que no se documenta.
- La resolución de salida está fijada en 512×512 píxeles, lo que limita su uso en aplicaciones que requieran alta resolución.
- Requiere dos tarjetas EP más la NPU del host, un despliegue de hardware considerable para un dispositivo de borde; no funciona con una sola tarjeta según la documentación.
- El tiempo de inicialización de ~110 s implica que los arranques en frío son lentos; la ventaja de mantener los módulos residentes solo se materializa en sesiones con múltiples generaciones.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas del codificador de texto; esta información no está disponible.
- No se especifican los esquemas de cuantización aplicados a los grafos RKNN, lo que dificulta evaluar la fidelidad numérica respecto al modelo original.
- El repositorio tiene un historial muy reciente (creado el 2026-11-06, actualizado el 2026-11-09) y un volumen de descargas bajo (85) y cero likes, por lo que la validación comunitaria es escasa.
- El manifiesto `qwenimage21.json` se mantiene fuera de Git LFS de forma deliberada; si se descarga mediante `git clone` sin `git lfs pull`, los pesos quedan como punteros LFS y el modelo no funcionará.
- No se aportan datos de benchmarks, latencia por imagen ni calidad de generación, lo que impide evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wardner/Qwen-Image-2.1
- Réplica del espejo para descarga (referenciada en la model card): https://hf-mirror.com
- Fichero de licencia del repositorio: LICENSE (incluido en el repo)
- Manifiesto de worker: `qwenimage21.json` (incluido en el repo, 5,9 KB)
- Documentación técnica del modelo: `docs/README.md` (incluido en el repo, 56,2 KB)
- Checksums: `SHA256SUMS` (incluido en el repo)
- Atribución: `NOTICE` (incluido en el repo)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
