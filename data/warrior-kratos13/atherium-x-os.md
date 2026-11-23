# warrior-kratos13/Atherium-X-OS

## Resumen

Atherium-X-OS no es un modelo de inteligencia artificial, sino una distribucion Linux live personalizada. Se trata de una imagen ISO basada en Debian 13 (`trixie`, `amd64`) construida con `live-build`, que arranca tanto en modo BIOS heredado como en UEFI. El repositorio de Hugging Face bajo el identificador `warrior-kratos13/Atherium-X-OS` aloja los artefactos de esta distribucion (imagen ISO y recursos asociados), con un tamano de repositorio de 0,7 GB y una ISO de 651,00 MB.

El sistema incluye un escritorio con estetica de HUD tipo JARVIS construido sobre Openbox, LXPanel, Rofi, Conky y Dunst, una animacion de arranque Plymouth con un reactor en rotacion, gestion grafica de Wi-Fi con un clic, APT, Snap Store, Firefox ESR, juegos nativos y mecanismos de gestion de memoria basados en `zram` y `earlyoom`. La compresion se realiza con SquashFS en XZ (`-b 1M -Xbcj x86`), dando como resultado un sistema de ficheros comprimido de 558,34 MB dentro de una ISO de 651,00 MB.

Es relevante ahora unicamente en el contexto de distribuciones live ligeras y personalizables para USB, no como componente de IA. El autor declara verificacion en hardware real (Dell Vostro 3520) para arranque UEFI, animacion Plymouth, Wi-Fi, Firefox ESR y aplicaciones de escritorio. No se dispone de informacion sobre arquitecturas de red neuronal, pesos, tokenizadores ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una distribucion Linux live basada en Debian 13 `trixie`, `amd64`) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto usa compresion SquashFS XZ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; el artefacto distribuido es una imagen ISO con sistema de ficheros SquashFS) |

## Arquitectura y entrenamiento

No aplica: Atherium-X-OS no es un modelo entrenado. El artefacto es una imagen de sistema operativo construida de forma reproducible mediante `live-build` sobre Debian 13 (`trixie`, `amd64`). La ISO es hibrida BIOS + UEFI y emplea compresion SquashFS en XZ con los parametros `-b 1M -Xbcj x86`, generando un sistema de ficheros comprimido de 558,34 MB y una ISO final de 651,00 MB.

El escritorio se compone de Openbox, LXPanel, Rofi (HUD), Conky, Dunst y un conjunto de iconos SVG propios (`Atherium-X-Icons`). La gestion de memoria se apoya en `zram` y `earlyoom`. El arranque incorpora una animacion Plymouth con un reactor en rotacion. No hay datos de entrenamiento, dataset, RLHF ni innovaciones de inferencia que reportar.

## Capacidades

- Arranque live en modo BIOS heredado y UEFI desde USB.
- Escritorio ligero con Openbox, LXPanel, Rofi HUD, Conky y Dunst.
- Animacion de arranque Plymouth con reactor en rotacion.
- Configuracion de Wi-Fi mediante interfaz grafica con un clic.
- Gestion de paquetes via APT y Snap Store.
- Navegador Firefox ESR preinstalado.
- Juegos nativos incluidos.
- Gestion de memoria con `zram` y `earlyoom`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni multilingues propias de un modelo de IA.

## Casos de uso

- Evaluacion de escritorios ligeros en USB: permite probar un entorno Openbox con HUD personalizado sin instalacion en disco, util para comparar consumo de recursos frente a escritorios completos.
- Recuperacion y diagnostico en equipos con arranque UEFI o BIOS: al ser una live hibrida, se puede usar para acceder a hardware y datos cuando el sistema instalado no arranca.
- Demostracion de personalizacion estetica: sirve como referencia para construir HUDs con Rofi, Conky y Dunst sobre Openbox en proyectos propios.
- Equipos con poca RAM: la combinacion de `zram` y `earlyoom` esta pensada para mitigar presion de memoria en sesiones live, adecuada para maquinas modestas.
- Formacion y talleres de `live-build`: el proyecto es reproducible y puede servir como ejemplo practico de construccion de una ISO Debian personalizada.
- Estacion de navegacion rapida: con Firefox ESR y Snap Store preinstalados, permite un entorno de navegacion funcional desde USB sin configuracion adicional.
- Verificacion de hardware: el autor reporta pruebas en un Dell Vostro 3520 para UEFI, Plymouth, Wi-Fi y aplicaciones de escritorio, lo que facilita replicar el entorno en equipos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Cabe en GPU consumer: no aplica.
- Almacenamiento: se necesita un dispositivo USB de al menos 651,00 MB para la ISO; se recomienda capacidad superior para persistencia y datos.
- Memoria RAM: no disponible en la informacion proporcionada; el uso de `zram` y `earlyoom` sugiere orientacion a equipos con memoria limitada.
- Firmware: arranque hibrido BIOS + UEFI; verificado en Dell Vostro 3520.
- Despliegue: grabacion en USB con Rufus (modo DD Image), balenaEtcher o `dd`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Producto | Base | Tamano | Arranque | Licencia | Notas |
|---|---|---|---|---|---|
| Atherium-X-OS | Debian 13 `trixie` | ISO 651,00 MB | BIOS + UEFI | MIT | HUD Openbox, Plymouth, zram/earlyoom |
| Debian Live oficial | Debian 13 | no disponible | BIOS + UEFI | licencias libres Debian | Entorno estandar sin personalizacion HUD |
| Otras live personalizadas | variable | no disponible | variable | variable | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas distribuciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje ni ofrece tool calling. Cualquier expectativa en ese sentido es incorrecta.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria independiente.
- Verificacion de hardware limitada a un unico equipo (Dell Vostro 3520) segun el autor; puede haber incompatibilidades en otros equipos.
- La ISO debe verificarse con el SHA256 publicado (`e7d15856716df13957ec61e8ff0f6fb44b8a113d112fab51f63ac2c37f85fe33`) antes de grabarla; una ISO corrupta puede impedir el arranque.
- La grabacion debe hacerse en modo DD Image; otros modos pueden generar un USB no arrancable.
- No se especifican idiomas soportados ni localizacion; no disponible.
- La licencia MIT afecta al proyecto, pero la ISO incluye paquetes de Debian y software de terceros sujetos a sus propias licencias; conviene revisarlas antes de redistribuir.
- Al ser una live sin datos de persistencia documentados, los cambios pueden perderse al reiniciar; no disponible confirmacion de soporte de persistencia.
- Riesgo de alucinacion: no aplica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/warrior-kratos13/Atherium-X-OS
- Codigo fuente en GitHub: https://github.com/Shreyas-krato13/Atherium-X
- Descarga de la ISO: https://huggingface.co/datasets/warrior-kratos13/Atherium-X-ISO/resolve/main/atherium-x.iso
- SHA256 de la ISO: `e7d15856716df13957ec61e8ff0f6fb44b8a113d112fab51f63ac2c37f85fe33`
